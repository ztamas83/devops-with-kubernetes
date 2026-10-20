import index from "./client/index.html";
import { imageRoutes } from "./server/api/imageRoutes";
import { createDiskImageRepository } from "./server/repositories/imageRepository";
import { createImageService } from "./server/services/imageService";

const PORT = Number(process.env.PORT) || 3000;
const IMAGE_DIR = process.env.IMAGE_DIR || "./data/images";
const IMAGE_MAX_AGE_MS = 10 * 60 * 1000;

const imageService = createImageService(createDiskImageRepository(IMAGE_DIR), {
  sourceUrl: "https://picsum.photos/600",
  maxAgeMs: IMAGE_MAX_AGE_MS,
});


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
  },
  development: process.env.NODE_ENV !== "production",
});

console.log(`Server started on port ${server.port}`);
console.log(`Caching images in ${IMAGE_DIR}`);


process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
