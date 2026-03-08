const crypto = require('node:crypto');
const {
  isKvConfigured,
  indexKey,
  itemKey,
  readJson,
  writeJson,
  getUserIdFromRequest
} = require('../_lib/archive-store');
const { sanitizeHtml } = require('../_lib/sanitize-html');

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

module.exports = async function handler(req, res) {
  if (!isKvConfigured()) {
    sendJson(res, 503, {
      error: 'Archive backend not configured. Add Vercel KV (KV_REST_API_*) or Upstash Redis (UPSTASH_REDIS_REST_*).'
    });
    return;
  }

  const userId = getUserIdFromRequest(req);
  const iKey = indexKey(userId);

  if (req.method === 'GET') {
    try {
      const index = await readJson(iKey, []);
      const items = Array.isArray(index) ? index : [];
      items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      sendJson(res, 200, { items });
    } catch (err) {
      sendJson(res, 500, { error: err.message || 'Archive listing failed' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = parseBody(req);
      const rawUrl = String(body.url || '').trim();
      const customTitle = String(body.title || '').trim();

      if (!rawUrl) {
        sendJson(res, 400, { error: 'Missing url' });
        return;
      }

      let target;
      try {
        target = new URL(rawUrl);
      } catch {
        sendJson(res, 400, { error: 'Invalid URL' });
        return;
      }

      if (!['http:', 'https:'].includes(target.protocol)) {
        sendJson(res, 400, { error: 'Only http/https URLs are allowed' });
        return;
      }

      const index = await readJson(iKey, []);
      const safeIndex = Array.isArray(index) ? index : [];
      const existing = safeIndex.find((entry) => entry.url === target.toString());
      if (existing) {
        sendJson(res, 200, { item: existing, alreadyArchived: true });
        return;
      }

      const remote = await fetch(target.toString(), {
        redirect: 'follow',
        headers: { 'User-Agent': 'SecuProgArchiveBot/1.0 (+vercel)' }
      });

      if (!remote.ok) {
        sendJson(res, 502, { error: `Remote server error: ${remote.status}` });
        return;
      }

      const htmlRaw = await remote.text();
      const { sourceTitle, html } = sanitizeHtml(htmlRaw);

      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const title = customTitle || sourceTitle || target.hostname;

      const snapshot = {
        id,
        url: target.toString(),
        title,
        sourceTitle,
        createdAt,
        html
      };

      const nextIndex = [
        ...safeIndex,
        { id, url: snapshot.url, title: snapshot.title, createdAt: snapshot.createdAt }
      ];

      await writeJson(itemKey(userId, id), snapshot);
      await writeJson(iKey, nextIndex);

      sendJson(res, 201, { item: { id, url: snapshot.url, title: snapshot.title, createdAt: snapshot.createdAt } });
    } catch (err) {
      sendJson(res, 500, { error: err.message || 'Archive creation failed' });
    }
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
};
