/**
 * Custom Next.js Server with Socket.IO Support
 *
 * Usage: node server.js
 * For development: npm run dev:socket (add to package.json)
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3002', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize Socket.IO (using dynamic import for ESM)
  import('./src/lib/socket-server.js').then(({ initSocketServer }) => {
    initSocketServer(server);
    console.log('[Socket.IO] Server initialized on port', port);
  }).catch((err) => {
    console.error('[Socket.IO] Failed to initialize:', err);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
