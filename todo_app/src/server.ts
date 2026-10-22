import index from "./client/index.html";
import { imageRoutes } from "./server/api/imageRoutes";
import { createDiskImageRepository } from "./server/repositories/imageRepository";
import { createImageService } from "./server/services/imageService";
import { config } from "./config";

const imageService = createImageService(createDiskImageRepository(config.imageDir), {
  sourceUrl: config.imageSourceUrl,
  maxAgeMs: config.imageMaxAgeMs,
});

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
    ...imageRoutes(imageService),
    "/todos": proxyToTodoBackend,
  },
  development: process.env.NODE_ENV !== "production",
});

console.log(`Server started on port ${server.port}`);
console.log(`Caching images in ${config.imageDir}`);
if (config.todoBackendUrl) console.log(`Proxying /todos to ${config.todoBackendUrl}`);


process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
