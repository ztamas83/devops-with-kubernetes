const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();

const server = app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
