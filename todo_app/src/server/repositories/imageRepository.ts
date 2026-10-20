import { mkdir, rename } from "node:fs/promises";
import { join } from "node:path";
import type { BunFile } from "bun";

export interface CachedImage {
  file: BunFile;
  fetchedAt: Date;
}

export interface ImageRepository {
  get(): Promise<CachedImage | null>;
  save(data: ArrayBuffer): Promise<CachedImage>;
}

const IMAGE_FILE = "image.jpg";

export function createDiskImageRepository(dir: string): ImageRepository {
  const imagePath = join(dir, IMAGE_FILE);

  return {
    async get() {
      const file = Bun.file(imagePath);
      if (!(await file.exists())) return null;
      return { file, fetchedAt: new Date(file.lastModified) };
    },

    async save(data) {
      await mkdir(dir, { recursive: true });
      // Write to a temp file and rename so readers never see a partial image
      const tmpPath = `${imagePath}.${process.pid}.tmp`;
      await Bun.write(tmpPath, data);
      await rename(tmpPath, imagePath);
      const file = Bun.file(imagePath);
      return { file, fetchedAt: new Date(file.lastModified) };
    },
  };
}
