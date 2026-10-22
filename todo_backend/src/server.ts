import { logged, withLogging } from "./api/requestLogger";
import { todoRoutes } from "./api/todoRoutes";
import { createPostgresTodoRepository } from "./repositories/todoRepository";
import { createTodoService } from "./services/todoService";
import { config } from "./config";
import { sql, waitForDatabase } from "./db";

await waitForDatabase();
const todoService = createTodoService(await createPostgresTodoRepository(sql));

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
    ...todoRoutes(todoService),
  }),
  fetch: logged(() => new Response("Not found", { status: 404 })),
});

console.log(`Server started on port ${server.port}`);

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
