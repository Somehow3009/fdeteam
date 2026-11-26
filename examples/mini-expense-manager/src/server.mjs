import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8' };
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  if (!['index.html', 'app.mjs', 'expenses.mjs'].includes(file)) {
    response.writeHead(404).end('Not found');
    return;
  }
  try {
    response.writeHead(200, { 'content-type': types[path.extname(file)] });
    response.end(await readFile(path.join(root, file)));
  } catch {
    response.writeHead(404).end('Not found');
  }
});
server.listen(Number(process.env.PORT ?? 4173), '127.0.0.1', () => process.stdout.write('Mini Expense Manager at http://127.0.0.1:4173\n'));
