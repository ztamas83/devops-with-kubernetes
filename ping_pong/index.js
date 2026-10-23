const http = require("http");
const postgres = require("postgres");
const PORT = process.env.PORT || 3000;

const REQUIRED_ENV = ["POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD"];
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnv.join(", ")}`,
  );
  process.exit(1);
}

const sql = postgres({
  host: process.env.POSTGRES_HOST || "postgres-svc.default",
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// The counter is a single row; the first ping inserts it with 0
async function initDb(retries = 10, delayMs = 3000) {
  for (let attempt = 1; ; attempt++) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS pongs (
          id    INT PRIMARY KEY,
          count INT NOT NULL
        )
      `;
      return;
    } catch (err) {
      if (attempt >= retries) throw err;
      console.log(
        `Database not ready (${err.message}), retrying in ${delayMs}ms (${attempt}/${retries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function getPersistedPingCount() {
  const [row] = await sql`SELECT count FROM pongs WHERE id = 1`;
  return row ? row.count : null;
}

async function ping() {
  const [row] = await sql`
    INSERT INTO pongs (id, count) VALUES (1, 0)
    ON CONFLICT (id) DO UPDATE SET count = pongs.count + 1
    RETURNING count
  `;
  return row.count;
}

// Middleware: logs each request and its response status with the handling time
function withLogging(handler) {
  return (req, res) => {
    const start = performance.now();
    const { pathname } = new URL(req.url, "http://localhost");
    console.log(`--> ${req.method} ${pathname}`);

    res.on("finish", () => {
      console.log(
        `<-- ${req.method} ${pathname} ${res.statusCode} ${Math.round(performance.now() - start)}ms`,
      );
    });

    Promise.resolve(handler(req, res)).catch((err) => {
      console.error(err);
      if (!res.headersSent)
        res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal server error");
    });
  };
}

const server = http.createServer(
  withLogging(async (req, res) => {
    if (req.method === "GET" && (req.url === "/")) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`Healthy`);
      return;
    }

    if (req.method === "GET" && (req.url === "/pingpong")) {
      const count = await ping();
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`pong ${count}`);
      return;
    }

    if (req.method === "GET" && req.url === "/pings") {
      const currentPings = (await getPersistedPingCount()) || 0;
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(currentPings.toString());
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }),
);

initDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server started in port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Could not initialize the database", err);
    process.exit(1);
  });

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down`);
  server.close(() => sql.end().then(() => process.exit(0)));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
