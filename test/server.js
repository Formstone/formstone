/**
 * @fileoverview Static file server for browser tests (no dependencies)
 *
 * Serves the repo root so fixtures can load src/, dist/ and node_modules/.
 * Usage: node test/server.js [port]
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let port = Number(process.argv[2] || process.env.PORT || 8765);

let types = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.scss': 'text/x-scss',
  '.svg': 'image/svg+xml',
};

http.createServer((req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = path.join(root, pathname);

  // Stay inside the repo
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();

    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404).end();

      return;
    }

    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    }).end(data);
  });
}).listen(port, () => {
  console.log(`Test server: http://localhost:${port}/`);
});
