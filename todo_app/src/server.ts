import index from "./client/index.html";
import { healthRoutes } from "./server/api/healthRoutes";
import { imageRoutes } from "./server/api/imageRoutes";
import { createDiskImageRepository } from "./server/repositories/imageRepository";
import { createHealthService } from "./server/services/healthService";
import { createImageService } from "./server/services/imageService";
import { config } from "./config";

const imageService = createImageService(createDiskImageRepository(config.imageDir), {
  sourceUrl: config.imageSourceUrl,
  maxAgeMs: config.imageMaxAgeMs,
});
const healthService = createHealthService({ todoBackendUrl: config.todoBackendUrl, timeoutMs: 1000 });

function proxyToTodoBackend(req: Request) {
  if (!config.todoBackendUrl) return new Response("Not found", { status: 404 });
  const { pathname, search } = new URL(req.url);
  return fetch(`${config.todoBackendUrl}${pathname}${search}`, {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });
}

function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down`);
  server.stop().then(() => process.exit(0));
}

const server = Bun.serve({
  port: config.port,
  routes: {
    "/": index,
    "/crash": () => { process.abort() },
    ...healthRoutes(healthService),
    ...imageRoutes(imageService),
    "/todos": proxyToTodoBackend,
    "/todos/:id": proxyToTodoBackend,
  },
  development: process.env.NODE_ENV !== "production",
});

console.log(`Server started on port ${server.port}`);
console.log(`Caching images in ${config.imageDir}`);
if (config.todoBackendUrl) console.log(`Proxying /todos to ${config.todoBackendUrl}`);


process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
