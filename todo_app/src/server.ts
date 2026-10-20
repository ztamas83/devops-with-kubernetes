import index from "./client/index.html";

const PORT = Number(process.env.PORT) || 3000;

const server = Bun.serve({
  port: PORT,
  routes: {
    "/": index,
  },
  development: process.env.NODE_ENV !== "production",
});

console.log(`Server started on port ${server.port}`);

function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down`);
  server.stop().then(() => process.exit(0));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
