const http = require('http');
const fs = require('fs');
const { formatWithOptions } = require('util');
const PORT = process.env.PORT || 3000;
const FILE_PATH = process.env.FILE_PATH || "/usr/src/app/files/count.txt"

function ping() {
  const count = 0;

  const newCount = fs.existsSync(FILE_PATH) ? Number.parseInt(fs.readFileSync(FILE_PATH).toString()) + 1 : 0;
  fs.writeFileSync(FILE_PATH, newCount.toString());

  return newCount;

}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    const count = ping();
    res.end(`pong ${count}`);
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
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
