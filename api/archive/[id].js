const {
  isKvConfigured,
  indexKey,
  itemKey,
  kvCommand,
  readJson,
  writeJson,
  getUserIdFromRequest
} = require('../_lib/archive-store');

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

module.exports = async function handler(req, res) {
  if (!isKvConfigured()) {
    sendJson(res, 503, {
      error: 'Archive backend not configured on Vercel. Add Vercel KV and env vars KV_REST_API_URL + KV_REST_API_TOKEN.'
    });
    return;
  }

  const userId = getUserIdFromRequest(req);
  const id = String(req.query.id || '').trim();
  if (!id) {
    sendJson(res, 400, { error: 'Missing id' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const item = await readJson(itemKey(userId, id), null);
      if (!item) {
        sendJson(res, 404, { error: 'Archive not found' });
        return;
      }
      sendJson(res, 200, item);
    } catch (err) {
      sendJson(res, 500, { error: err.message || 'Archive read failed' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const iKey = indexKey(userId);
      const index = await readJson(iKey, []);
      const safeIndex = Array.isArray(index) ? index : [];
      const nextIndex = safeIndex.filter((entry) => entry.id !== id);

      await kvCommand(['DEL', itemKey(userId, id)]);
      await writeJson(iKey, nextIndex);

      sendJson(res, 200, { ok: true });
    } catch (err) {
      sendJson(res, 500, { error: err.message || 'Archive deletion failed' });
    }
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
};
