import { logged, withLogging } from "./api/requestLogger";
import { todoRoutes } from "./api/todoRoutes";
import { createInMemoryTodoRepository } from "./repositories/todoRepository";
import { createTodoService } from "./services/todoService";

const PORT = Number(process.env.PORT) || 3001;

const todoService = createTodoService(createInMemoryTodoRepository());

function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down`);
  server.stop().then(() => process.exit(0));
}

const server = Bun.serve({
  port: PORT,
  routes: withLogging({
    ...todoRoutes(todoService),
  }),
  fetch: logged(() => new Response("Not found", { status: 404 })),
});

console.log(`Server started on port ${server.port}`);

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
