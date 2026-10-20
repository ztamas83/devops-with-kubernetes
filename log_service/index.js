const { randomUUID } = require('crypto');
const http = require('http');
const fs = require('fs');

const id = randomUUID();
const INTERVAL_MS = 5000;
const PORT = process.env.PORT || 3000;
const LOG_PATH = process.env.LOG_PATH || "/usr/src/app/files"
const LOGFILE = `${LOG_PATH}/log.txt`
const PINGFILE = `${LOG_PATH}/ping.txt`

let timestamp;

function print() {
  timestamp = new Date().toISOString();
  const data = `${timestamp} ${id}`;
  console.log(data);

  try {
    fs.writeFileSync(LOGFILE, `${data}\n`);
  }
  catch (err) {
    console.error("Could not write to file", err)
  }
}

console.log(`Configured file path: ${LOG_PATH}`);


function readLog() {
  return fs.readFileSync(LOGFILE).toString();
}

function readPing() {

  return fs.existsSync(PINGFILE) ? Number.parseInt(fs.readFileSync(PINGFILE).toString()) : 0;
}

let server = undefined;
let timer = undefined;

function shutdown(signal) {
    console.log(`Received ${signal}, shutting down`);
    clearInterval(timer);
    server?.close(() => process.exit(0));
}

if (process.env.SERVER && process.env.SERVER === "1") { // log reader
  server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/status') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });

      const content = `${readLog()}Ping / Pongs: ${readPing()}`;

      res.end(content);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  server?.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
else { // log generator
  print();
  timer = setInterval(print, INTERVAL_MS);
}


