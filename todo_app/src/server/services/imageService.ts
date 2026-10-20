import type { BunFile } from "bun";
import type { CachedImage, ImageRepository } from "../repositories/imageRepository";

export interface ImageServiceOptions {
  sourceUrl: string;
  maxAgeMs: number;
}

export interface ImageService {
  getImage(): Promise<BunFile>;
}

export function createImageService(
  repository: ImageRepository,
  { sourceUrl, maxAgeMs }: ImageServiceOptions,
): ImageService {
  // Shared between concurrent callers so an expired cache triggers one fetch only
  let refreshing: Promise<CachedImage> | null = null;

  async function fetchAndStore(): Promise<CachedImage> {
    const res = await fetch(sourceUrl);
    if (!res.ok) {
      throw new Error(`Image fetch failed: ${res.status} ${res.statusText}`);
    }
    return repository.save(await res.arrayBuffer());
  }

  function refresh(): Promise<CachedImage> {
    refreshing ??= fetchAndStore().finally(() => {
      refreshing = null;
    });
    return refreshing;
  }

  return {
    async getImage() {
      const cached = await repository.get();
      if (cached && Date.now() - cached.fetchedAt.getTime() < maxAgeMs) {
        return cached.file;
      }

      try {
        return (await refresh()).file;
      } catch (err) {
        // Better a stale image than none when the source is unreachable
        if (cached) {
          console.error(`Serving stale image: ${(err as Error).message}`);
          return cached.file;
        }
        throw err;
      }
    },
  };
}
