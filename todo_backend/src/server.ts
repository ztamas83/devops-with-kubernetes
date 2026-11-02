import { logged, withLogging } from "./api/requestLogger";
import { healthRoutes } from "./api/healthRoutes";
import { todoRoutes } from "./api/todoRoutes";
import { createPostgresTodoRepository } from "./repositories/todoRepository";
import { createTodoService } from "./services/todoService";
import { config } from "./config";
import { isDatabaseReachable, sql, waitForDatabase } from "./db";
import { runMigrations } from "./migrations";

await waitForDatabase();
await runMigrations(sql);
const todoService = createTodoService(createPostgresTodoRepository(sql));

function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down`);
  server
    .stop()
    .then(() => sql.close())
    .then(() => process.exit(0));
}

const server = Bun.serve({
  port: config.port,
  routes: withLogging({
    "/": { GET() { return new Response("Healthy", { status: 200, headers: { "Content-Type": "text/plain"}} )} },
    ...healthRoutes(isDatabaseReachable),
    ...todoRoutes(todoService),
  }),
  fetch: logged(() => new Response("Not found", { status: 404 })),
});

console.log(`Server started on port ${server.port}`);

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
