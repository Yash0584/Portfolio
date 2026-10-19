'use strict';

// Dependency-free Node.js backend for the portfolio and contact form.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 3000);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const DATA_DIR = path.resolve(__dirname, 'data');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const MAX_BODY_BYTES = 12 * 1024;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const requestLog = new Map();

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8'
};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  if (res.writableEnded) return;
  const payload = Buffer.isBuffer(body) ? body : (typeof body === 'string' ? body : JSON.stringify(body));
  res.writeHead(status, {
    'Content-Type': type,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cache-Control': type.includes('application/json') ? 'no-store' : 'public, max-age=3600'
  });
  res.end(payload);
}

function readMessages() {
  try {
    const parsed = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not read message inbox:', error.message);
    return [];
  }
}

function saveMessages(messages) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temporary = `${MESSAGES_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(messages, null, 2), { mode: 0o600 });
  fs.renameSync(temporary, MESSAGES_FILE);
}

function getClientKey(req) {
  // Do not trust X-Forwarded-For unless your hosting provider's proxy configuration is known.
  return req.socket.remoteAddress || 'unknown';
}

function isRateLimited(key) {
  const now = Date.now();
  const recent = (requestLog.get(key) || []).filter(time => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) { requestLog.set(key, recent); return true; }
  recent.push(now); requestLog.set(key, recent);
  if (requestLog.size > 5000) {
    for (const [ip, times] of requestLog) if (!times.some(time => now - time < RATE_WINDOW_MS)) requestLog.delete(ip);
  }
  return false;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) { reject(Object.assign(new Error('Request body is too large.'), { statusCode: 413 })); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(Object.assign(new Error('Invalid JSON request.'), { statusCode: 400 })); }
    });
    req.on('error', reject);
  });
}

function validEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handle(req, res) {
  let url;
  try { url = new URL(req.url, 'http://localhost'); }
  catch { return send(res, 400, { error: 'Invalid URL.' }); }

  if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { ok: true });

  if (req.method === 'GET' && url.pathname === '/api/portfolio') {
    try {
      const data = fs.readFileSync(PORTFOLIO_FILE, 'utf8');
      JSON.parse(data); // Fail cleanly if the data file was edited into invalid JSON.
      return send(res, 200, data);
    } catch (error) {
      console.error('Portfolio data unavailable:', error.message);
      return send(res, 500, { error: 'Portfolio content is temporarily unavailable.' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/contact') {
    const contentType = String(req.headers['content-type'] || '').toLowerCase();
    if (!contentType.includes('application/json')) return send(res, 415, { error: 'Send the form as JSON.' });
    let body;
    try { body = await readJsonBody(req); }
    catch (error) { if (!res.writableEnded) send(res, error.statusCode || 400, { error: error.message || 'Invalid request.' }); return; }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return send(res, 400, { error: 'Invalid request.' });
    if (String(body.website || '').trim()) return send(res, 200, { ok: true }); // Honeypot for simple bots.

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const message = String(body.message || '').trim();
    if (!name || name.length > 100) return send(res, 400, { error: 'Please enter a name (up to 100 characters).' });
    if (!validEmail(email)) return send(res, 400, { error: 'Please enter a valid email address.' });
    if (message.length < 10 || message.length > 2000) return send(res, 400, { error: 'Message must be between 10 and 2,000 characters.' });
    if (isRateLimited(getClientKey(req))) return send(res, 429, { error: 'Too many messages from this connection. Please try again in an hour.' });

    const messages = readMessages();
    messages.push({ id: crypto.randomUUID(), name, email, message, at: new Date().toISOString() });
    try { saveMessages(messages); }
    catch (error) { console.error('Could not save contact message:', error.message); return send(res, 500, { error: 'Message could not be saved. Please email me directly.' }); }
    return send(res, 201, { ok: true });
  }

  if (req.method === 'GET' && url.pathname === '/api/messages') {
    if (!ADMIN_TOKEN) return send(res, 503, { error: 'Inbox access is disabled. Configure ADMIN_TOKEN on the server.' });
    const provided = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const expected = Buffer.from(ADMIN_TOKEN);
    const actual = Buffer.from(provided);
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return send(res, 401, { error: 'Unauthorized.' });
    return send(res, 200, readMessages());
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed.' });
  let decoded;
  try { decoded = decodeURIComponent(url.pathname); }
  catch { return send(res, 400, 'Invalid path.', 'text/plain; charset=utf-8'); }
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const filePath = path.resolve(PUBLIC_DIR, relative);
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, 'Forbidden.', 'text/plain; charset=utf-8');
  fs.readFile(filePath, (error, contents) => {
    if (error) return send(res, 404, 'Not found.', 'text/plain; charset=utf-8');
    if (req.method === 'HEAD') {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
      return res.end();
    }
    return send(res, 200, contents, MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
  });
}

http.createServer((req, res) => {
  handle(req, res).catch(error => {
    console.error('Request error:', error.message);
    if (!res.headersSent) send(res, 500, { error: 'Unexpected server error.' });
    else res.destroy();
  });
}).listen(PORT, () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Portfolio running at http://localhost:${PORT}`);
  if (!ADMIN_TOKEN) console.log('Inbox API is disabled until ADMIN_TOKEN is configured.');
});
