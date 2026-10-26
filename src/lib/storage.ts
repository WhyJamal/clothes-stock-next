import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Uploaded photos live outside `public/`: Next.js does not serve files that are added to
// `public/` after the build. They are served by src/app/uploads/[...path]/route.ts instead.
//
// UPLOAD_DIR can point to any folder (a mounted disk on a server). To move to S3 later,
// only saveProductImage() has to change: it returns the URL that is stored in the database.
export const UPLOAD_ROOT = path.resolve(
  /*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? path.join(process.cwd(), "storage", "uploads"),
);

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/** Resizes (max 1600px, transparency is kept), converts to WebP, stores it and returns its public URL. */
export async function saveProductImage(input: Buffer): Promise<string> {
  const webp = await sharp(input)
    .rotate() // respect the phone's orientation
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer();

  const name = `${randomUUID()}.webp`; // a new name every time, so the file can be cached forever
  const dir = path.join(UPLOAD_ROOT, "products");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), webp);
  return `/uploads/products/${name}`;
}
