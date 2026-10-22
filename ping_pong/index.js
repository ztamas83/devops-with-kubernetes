const http = require('http');
const fs = require('fs');
const PORT = process.env.PORT || 3000;
const FILE_PATH = process.env.FILE_PATH || "/usr/src/app/files/count.txt"


function getPersistedPingCount() {
  return fs.existsSync(FILE_PATH) ? Number.parseInt(fs.readFileSync(FILE_PATH).toString()) : null;
}

function ping() {
  const newCount = fs.existsSync(FILE_PATH) ? getPersistedPingCount() + 1 : 0;
  fs.writeFileSync(FILE_PATH, newCount.toString());
  return newCount;
}

// Middleware: logs each request and its response status with the handling time
function withLogging(handler) {
  return (req, res) => {
    const start = performance.now();
    const { pathname } = new URL(req.url, 'http://localhost');
    console.log(`--> ${req.method} ${pathname}`);

    res.on('finish', () => {
      console.log(`<-- ${req.method} ${pathname} ${res.statusCode} ${Math.round(performance.now() - start)}ms`);
    });

    handler(req, res);
  };
}

const server = http.createServer(withLogging((req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    const count = ping();
    res.end(`pong ${count}`);
    return;
  }

  if (req.method === 'GET' && req.url === '/pings') {
    res.writeHead(200, { 'Content-Type': 'text/plain'})
    const currentPings = getPersistedPingCount() || 0;
    res.end(currentPings.toString());
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}));

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
