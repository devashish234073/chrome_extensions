const http = require('http');
const { request } = require('http');
const { URL } = require('url');

const PORT = 3000;
const TARGET_URL = 'http://localhost:11434/api/generate';

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    // Handle preflight request
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': 86400,
    });
    res.end();
    return;
  }

  if (req.url === '/api/generate' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      // Forward the request to Ollama
      const target = new URL(TARGET_URL);
      const proxyReq = request({
        hostname: target.hostname,
        port: target.port,
        path: target.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      }, proxyRes => {
        let responseBody = '';

        proxyRes.on('data', chunk => {
          responseBody += chunk.toString();
        });

        proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // Enable CORS for browser
          });
          res.end(responseBody);
        });
      });

      proxyReq.on('error', err => {
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      });

      proxyReq.write(body);
      proxyReq.end();
    });
  } else {
    res.writeHead(404, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Proxy server listening at http://localhost:${PORT}`);
});
