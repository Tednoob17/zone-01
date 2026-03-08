const crypto = require('node:crypto');

const KV_URL = process.env.KV_REST_API_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || '';

function isKvConfigured() {
  return Boolean(KV_URL && KV_TOKEN);
}

function sanitizeUserId(raw) {
  const value = String(raw || '').trim();
  if (!value) return 'default';
  if (/^[a-zA-Z0-9_-]{6,96}$/.test(value)) return value;
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

async function kvCommand(args) {
  if (!isKvConfigured()) {
    throw new Error('Vercel KV is not configured (missing KV_REST_API_URL or KV_REST_API_TOKEN).');
  }

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
  kvCommand,
  indexKey,
  itemKey,
  readJson,
  writeJson,
  getUserIdFromRequest
};
