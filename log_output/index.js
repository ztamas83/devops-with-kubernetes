const { randomUUID } = require('crypto');
const http = require('http');

const id = randomUUID();
const INTERVAL_MS = 5000;
const PORT = process.env.PORT || 3000;

let timestamp;

function print() {
  timestamp = new Date().toISOString();
  console.log(`${timestamp} ${id}`);
}

print();
const timer = setInterval(print, INTERVAL_MS);

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ timestamp, id }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down`);
  clearInterval(timer);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
