const { randomUUID } = require('crypto');

const id = randomUUID();
const INTERVAL_MS = 5000;

function print() {
  console.log(`${new Date().toISOString()} ${id}`);
}

print();
const timer = setInterval(print, INTERVAL_MS);

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down`);
  clearInterval(timer);
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
