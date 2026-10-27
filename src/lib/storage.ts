import { randomUUID } from "node:crypto";
import path from "node:path";
import { del, put } from "@vercel/blob";
import sharp from "sharp";

// Photos live in Vercel Blob: storage/uploads/<top|bottom|footwear>/<uuid>.webp
// The database stores the full public Blob URL, so the browser loads the photo straight
// from the Blob CDN. Needs BLOB_READ_WRITE_TOKEN (added automatically when the store is
// connected to the Vercel project; locally use `vercel env pull`).

/** Only for old photos saved on disk before Blob was connected (see src/app/uploads/[...path]/route.ts). */
export const UPLOAD_ROOT = path.resolve(
  /*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? path.join(process.cwd(), "storage", "uploads"),
);

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/** Blob folder per product type: top / bottom / footwear. */
export const UPLOAD_FOLDERS = ["top", "bottom", "footwear"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const isUploadFolder = (v: unknown): v is UploadFolder =>
  typeof v === "string" && (UPLOAD_FOLDERS as readonly string[]).includes(v);

/** Resizes (max 1600px, transparency is kept), converts to WebP, uploads to Blob and returns its public URL. */
export async function saveProductImage(input: Buffer, folder: UploadFolder): Promise<string> {
  const webp = await sharp(input)
    .rotate() // respect the phone's orientation
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer();

  // a new name every time, so the file can be cached forever
  const blob = await put(`storage/uploads/${folder}/${randomUUID()}.webp`, webp, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: false,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
  return blob.url;
}

const isBlobUrl = (url: string) => {
  try {
    return new URL(url).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false; // "/products/..." from the seed or "/uploads/..." from the old disk storage
  }
};

/** Deletes photos from Blob. Other URLs (seed photos in public/) are skipped. Never throws. */
export async function deleteProductImages(urls: (string | null | undefined)[]): Promise<void> {
  const blobs = [...new Set(urls.filter((u): u is string => Boolean(u)))].filter(isBlobUrl);
  if (blobs.length === 0) return;
  try {
    await del(blobs);
  } catch (err) {
    console.error("blob delete failed", err);
  }
}
