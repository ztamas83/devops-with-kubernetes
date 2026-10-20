import type { ImageService } from "../services/imageService";

export function imageRoutes(imageService: ImageService) {
  return {
    "/api/image": {
      async GET() {
        try {
          const image = await imageService.getImage();
          return new Response(image, {
            headers: {
              "Content-Type": "image/jpeg",
              "Cache-Control": "no-store",
            },
          });
        } catch (err) {
          console.error((err as Error).message);
          return new Response("Image unavailable", { status: 502 });
        }
      },
    },
  };
}
