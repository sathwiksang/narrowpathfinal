// Serves dist/ with GitHub Pages semantics so tests exercise production behaviour:
//   /            -> index.html
//   /about       -> about.html (extensionless fallback)
//   unknown path -> 404.html with HTTP 404
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'dist');
const PORT = Number(process.env.PORT ?? 4321);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

const isFile = async (path) => (await stat(path).catch(() => null))?.isFile() ?? false;

const resolve = async (urlPath) => {
  const clean = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const base = join(ROOT, clean);
  const candidates = clean.endsWith('/') ? [join(base, 'index.html')] : [base, `${base}.html`];
  for (const file of candidates) if (await isFile(file)) return file;
  return null;
};

createServer(async (req, res) => {
  let path;
  try {
    path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad Request'); // malformed percent-encoding
    return;
  }
  const file = await resolve(path);
  const target = file ?? join(ROOT, '404.html');
  res.writeHead(file ? 200 : 404, { 'Content-Type': TYPES[extname(target)] ?? 'application/octet-stream' });
  res.end(await readFile(target));
}).listen(PORT, '127.0.0.1', () => console.log(`Serving dist/ on http://127.0.0.1:${PORT}`));
