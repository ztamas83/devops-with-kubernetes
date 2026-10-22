import index from "./client/index.html";
import { imageRoutes } from "./server/api/imageRoutes";
import { createDiskImageRepository } from "./server/repositories/imageRepository";
import { createImageService } from "./server/services/imageService";

const PORT = Number(process.env.PORT) || 3000;
const IMAGE_DIR = process.env.IMAGE_DIR || "./data/images";
const IMAGE_MAX_AGE_MS = 10 * 60 * 1000;
// Only for local development, in the cluster the Ingress routes /todos to todo-backend
const TODO_BACKEND_URL = process.env.TODO_BACKEND_URL;

const imageService = createImageService(createDiskImageRepository(IMAGE_DIR), {
  sourceUrl: "https://picsum.photos/600",
  maxAgeMs: IMAGE_MAX_AGE_MS,
});

function proxyToTodoBackend(req: Request) {
  if (!TODO_BACKEND_URL) return new Response("Not found", { status: 404 });
  const { pathname, search } = new URL(req.url);
  return fetch(`${TODO_BACKEND_URL}${pathname}${search}`, {
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
  port: PORT,
  routes: {
    "/": index,
    "/crash": () => { process.abort() },
    ...imageRoutes(imageService),
    "/todos": proxyToTodoBackend,
  },
  development: process.env.NODE_ENV !== "production",
});

console.log(`Server started on port ${server.port}`);
console.log(`Caching images in ${IMAGE_DIR}`);
if (TODO_BACKEND_URL) console.log(`Proxying /todos to ${TODO_BACKEND_URL}`);


process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
