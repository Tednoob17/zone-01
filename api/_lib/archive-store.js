const crypto = require('node:crypto');

const KV_URL = process.env.KV_REST_API_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || '';
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || '';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';

function isKvConfigured() {
  return Boolean((KV_URL && KV_TOKEN) || (UPSTASH_URL && UPSTASH_TOKEN));
}

function storageMode() {
  if (KV_URL && KV_TOKEN) return 'vercel-kv';
  if (UPSTASH_URL && UPSTASH_TOKEN) return 'upstash';
  return 'none';
}

function sanitizeUserId(raw) {
  const value = String(raw || '').trim();
  if (!value) return 'default';
  if (/^[a-zA-Z0-9_-]{6,96}$/.test(value)) return value;
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

async function kvCommand(args) {
  const mode = storageMode();
  if (mode === 'none') {
    throw new Error('Storage is not configured (set KV_REST_API_* or UPSTASH_REDIS_REST_* env vars).');
  }

  if (mode === 'vercel-kv') {
    const res = await fetch(KV_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`KV HTTP ${res.status}${text ? `: ${text}` : ''}`);
    }

    const payload = await res.json();
    if (payload && payload.error) {
      throw new Error(`KV error: ${payload.error}`);
    }
    return payload ? payload.result : null;
  }

  const endpoint = `${UPSTASH_URL.replace(/\/$/, '')}/pipeline`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([args])
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upstash HTTP ${res.status}${text ? `: ${text}` : ''}`);
  }

  const payload = await res.json();
  const first = Array.isArray(payload) ? payload[0] : payload;
  if (first && first.error) {
    throw new Error(`Upstash error: ${first.error}`);
  }
  if (first && Object.prototype.hasOwnProperty.call(first, 'result')) {
    return first.result;
  }
  return first || null;
}

function indexKey(userId) {
  return `secu:archive:index:${userId}`;
}

function itemKey(userId, id) {
  return `secu:archive:item:${userId}:${id}`;
}

async function readJson(key, fallbackValue) {
  const value = await kvCommand(['GET', key]);
  if (!value) return fallbackValue;
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

async function writeJson(key, value) {
  await kvCommand(['SET', key, JSON.stringify(value)]);
}

function getUserIdFromRequest(req) {
  const headerValue = req.headers['x-archive-user'];
  const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  return sanitizeUserId(raw || 'default');
}

module.exports = {
  isKvConfigured,
  storageMode,
  kvCommand,
  indexKey,
  itemKey,
  readJson,
  writeJson,
  getUserIdFromRequest
};
