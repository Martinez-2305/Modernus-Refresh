import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const rootWithSep = root.endsWith(sep) ? root : root + sep;
const port = 3000;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
    if (urlPath.endsWith('/')) urlPath += 'index.html';
    // Resolve against root, treating urlPath as relative ('.' prefix) so a
    // leading '/' or '..' segments can't escape the served directory.
    const filePath = resolve(root, '.' + urlPath);
    if (filePath !== root && !filePath.startsWith(rootWithSep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': types[extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
});

server.listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`));
