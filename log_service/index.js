const { randomUUID } = require("crypto");

const id = randomUUID();
const INTERVAL_MS = 5000;
const PING_TIMEOUT_MS = 1000;
const PORT = Number(process.env.PORT) || 3000;
const LOG_PATH = process.env.LOG_PATH || "/usr/src/app/files";
const LOGFILE = `${LOG_PATH}/log.txt`;
const PING_SVC_URL = process.env.PING_SVC_URL || "http://localhost:3000";

let timestamp;

async function print() {
  timestamp = new Date().toISOString();
  const data = `${timestamp} ${id}`;
  console.log(data);

  try {
    await Bun.write(LOGFILE, `${data}\n`);
  } catch (err) {
    console.error("Could not write to file", err);
  }
}

console.log(`Configured file path: ${LOG_PATH}`);

async function readLog() {
  return await Bun.file(LOGFILE, () => console.error("Could not read file")).text();
}

async function readPing() {
  const res = await fetch(`${PING_SVC_URL}/pings`, {
    signal: AbortSignal.timeout(PING_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Ping fetch failed: ${res.status} ${res.statusText}`);
  }
  return Number.parseInt(await res.text());
}

// Middleware: logs each request and its response status with the handling time
function withLogging(handler) {
  return async (req, server) => {
    const start = performance.now();
    const { pathname } = new URL(req.url);
    console.log(`--> ${req.method} ${pathname}`);

    try {
      const res = await handler(req, server);
      console.log(
        `<-- ${req.method} ${pathname} ${res.status} ${Math.round(performance.now() - start)}ms`,
      );
      return res;
    } catch (err) {
      console.log(
        `<-- ${req.method} ${pathname} 500 ${Math.round(performance.now() - start)}ms`,
      );
      throw err;
    }
  };
}

let server = undefined;
let timer = undefined;

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down`);
  clearInterval(timer);
  if (!server) process.exit(0);
  server.stop().then(() => process.exit(0));
}

if (process.env.SERVER && process.env.SERVER === "1") {
  // log reader
  server = Bun.serve({
    port: PORT,
    routes: {
      "/": {
        GET: () => new Response("Healthy", { status: 200 })
      },
      "/status": {
        GET: withLogging(async () => {
          try {
            const fileContent = await Bun.file(
              "./config/information.txt",
            ).text();
            const envContent = process.env.MESSAGE;
            const log = await readLog();
            const ping = await readPing();
            const content = `file content: ${fileContent}\nenv variable: ${envContent}\n${log}Ping / Pongs: ${ping}`;
            return new Response(content, {
              headers: { "Content-Type": "text/plain" },
            });
          } catch (err) {
            console.error(err.message);
            return new Response("Status unavailable", { status: 502 });
          }
        }),
      },
    },
    fetch: withLogging(() => new Response("Not found", { status: 404 })),
  });

  console.log(`Server started on port ${server.port}`);
  console.log(`Reading pings from ${PING_SVC_URL}`);
} else {
  // log generator
  print();
  timer = setInterval(print, INTERVAL_MS);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
