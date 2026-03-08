const http = require('node:http');
const fs = require('node:fs/promises');
const fssync = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, '.local-archive');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');
const PORT = Number(process.env.PORT || 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  if (!fssync.existsSync(INDEX_FILE)) {
    await fs.writeFile(INDEX_FILE, '[]', 'utf8');
  }
}

async function loadIndex() {
  try {
    const raw = await fs.readFile(INDEX_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveIndex(index) {
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');
}

function sendJson(res, code, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function sendText(res, code, text, type = 'text/plain; charset=utf-8') {
  res.writeHead(code, {
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(text)
  });
  res.end(text);
}

async function parseJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
    if (chunks.reduce((sum, c) => sum + c.length, 0) > 1024 * 1024) {
      throw new Error('Payload too large');
    }
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function sanitizeHtml(raw) {
  const titleMatch = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const sourceTitle = titleMatch ? decodeEntities(titleMatch[1].trim()) : 'Untitled';

  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : raw;

  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<canvas[\s\S]*?<\/canvas>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"')
    .replace(/href\s*=\s*'javascript:[^']*'/gi, 'href="#"');

  const wrapped = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(sourceTitle)} (Archived)</title>
<style>
:root { color-scheme: light; }
body { font-family: Georgia, serif; max-width: 900px; margin: 0 auto; padding: 24px; line-height: 1.65; color: #111; background: #fafaf8; }
a { color: #0b63b6; }
img, video { max-width: 100%; height: auto; }
pre, code { white-space: pre-wrap; word-wrap: break-word; }
blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding: 0.2em 1em; color: #444; }
</style>
</head>
<body>
${body}
</body>
</html>`;

  return { sourceTitle, html: wrapped };
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safePathFromUrl(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const clean = decoded === '/' ? '/sec.html' : decoded;
  const full = path.normalize(path.join(ROOT, clean));
  if (!full.startsWith(ROOT)) return null;
  return full;
}

async function serveStatic(req, res) {
  const fullPath = safePathFromUrl(req.url || '/');
  if (!fullPath) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  try {
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      sendText(res, 403, 'Directory listing is disabled');
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    const data = await fs.readFile(fullPath);
    res.writeHead(200, { 'Content-Type': mime, 'Content-Length': data.length });
    res.end(data);
  } catch {
    sendText(res, 404, 'Not found');
  }
}

async function handleApi(req, res) {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  if (req.method === 'GET' && pathname === '/api/archive') {
    const index = await loadIndex();
    sendJson(res, 200, { items: index.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/archive') {
    try {
      const body = await parseJsonBody(req);
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

      const index = await loadIndex();
      const existing = index.find((entry) => entry.url === target.toString());
      if (existing) {
        sendJson(res, 200, { item: existing, alreadyArchived: true });
        return;
      }

      const response = await fetch(target.toString(), {
        redirect: 'follow',
        headers: {
          'User-Agent': 'SecuProgArchiveBot/1.0 (+local)'
        }
      });

      if (!response.ok) {
        sendJson(res, 502, { error: `Remote server error: ${response.status}` });
        return;
      }

      const htmlRaw = await response.text();
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

      await fs.writeFile(path.join(DATA_DIR, `${id}.json`), JSON.stringify(snapshot, null, 2), 'utf8');
      index.push({ id, url: snapshot.url, title: snapshot.title, createdAt });
      await saveIndex(index);

      sendJson(res, 201, { item: { id, url: snapshot.url, title: snapshot.title, createdAt } });
    } catch (err) {
      sendJson(res, 500, { error: err.message || 'Archive failed' });
    }
    return;
  }

  if (req.method === 'GET' && pathname.startsWith('/api/archive/')) {
    const id = pathname.split('/').pop();
    if (!id) {
      sendJson(res, 400, { error: 'Missing id' });
      return;
    }

    try {
      const raw = await fs.readFile(path.join(DATA_DIR, `${id}.json`), 'utf8');
      const parsed = JSON.parse(raw);
      sendJson(res, 200, parsed);
    } catch {
      sendJson(res, 404, { error: 'Archive not found' });
    }
    return;
  }

  if (req.method === 'DELETE' && pathname.startsWith('/api/archive/')) {
    const id = pathname.split('/').pop();
    if (!id) {
      sendJson(res, 400, { error: 'Missing id' });
      return;
    }

    const index = await loadIndex();
    const next = index.filter((entry) => entry.id !== id);

    try {
      await fs.unlink(path.join(DATA_DIR, `${id}.json`));
    } catch {
      // ignore missing file
    }

    await saveIndex(next);
    sendJson(res, 200, { ok: true });
    return;
  }

  sendJson(res, 404, { error: 'API route not found' });
}

async function main() {
  await ensureDataDir();

  const server = http.createServer(async (req, res) => {
    try {
      if ((req.url || '').startsWith('/api/')) {
        await handleApi(req, res);
        return;
      }
      await serveStatic(req, res);
    } catch (err) {
      sendJson(res, 500, { error: err.message || 'Internal server error' });
    }
  });

  server.listen(PORT, () => {
    console.log(`Archive server running on http://localhost:${PORT}`);
    console.log('Open http://localhost:' + PORT + '/sec.html');
  });
}

main();
