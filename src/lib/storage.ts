import { randomUUID } from "node:crypto";
import { del, put, type PutCommandOptions } from "@vercel/blob";
import sharp from "sharp";

// Photos live in Vercel Blob: storage/uploads/<top|bottom|footwear>/<file>.webp
//
// The code works with both kinds of store, whichever BLOB_READ_WRITE_TOKEN points to:
//  - PUBLIC store:  the database keeps the full Blob URL (https://...blob.vercel-storage.com/...)
//                   and the browser loads the photo straight from the Blob CDN.
//  - PRIVATE store: the database keeps "/uploads/<folder>/<file>.webp" and
//                   src/app/uploads/[...path]/route.ts streams the photo from Blob.
// Public is tried first; if the store turns out to be private, the upload is repeated as private.
// BLOB_READ_WRITE_TOKEN is added by Vercel when a store is connected to the project;
// locally use `vercel env pull .env.local`.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/** Blob folder per product type: top / bottom / footwear. */
export const UPLOAD_FOLDERS = ["top", "bottom", "footwear"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const isUploadFolder = (v: unknown): v is UploadFolder =>
  typeof v === "string" && (UPLOAD_FOLDERS as readonly string[]).includes(v);

/** Where the file lives inside the Blob store. */
export const blobPathname = (folder: UploadFolder, file: string) => `storage/uploads/${folder}/${file}`;

/** The URL a photo of a private store gets in the database. */
const privatePhotoUrl = (folder: UploadFolder, file: string) => `/uploads/${folder}/${file}`;

const isPrivateStoreError = (err: unknown) =>
  err instanceof Error && /public access/i.test(err.message) && /private/i.test(err.message);

let storeIsPrivate = false; // remembered after the first failed public upload

/**
 * Uploads one file and returns the URL to store in the database.
 * Tries a public blob first and falls back to a private one if the store is private.
 */
export async function savePhotoFile(
  folder: UploadFolder,
  file: string,
  body: Buffer,
  extra: Omit<PutCommandOptions, "access"> = {},
): Promise<string> {
  const pathname = blobPathname(folder, file);
  const options = { contentType: "image/webp", addRandomSuffix: false, ...extra };

  if (!storeIsPrivate) {
    try {
      const blob = await put(pathname, body, { ...options, access: "public" });
      return blob.url;
    } catch (err) {
      if (!isPrivateStoreError(err)) throw err;
      storeIsPrivate = true;
      console.warn("[blob] the store is private: photos are saved as private and served by /uploads/...");
    }
  }

  await put(pathname, body, { ...options, access: "private" });
  return privatePhotoUrl(folder, file);
}

/** Resizes (max 1600px, transparency is kept), converts to WebP, uploads to Blob and returns the photo URL. */
export async function saveProductImage(input: Buffer, folder: UploadFolder): Promise<string> {
  const webp = await sharp(input)
    .rotate() // respect the phone's orientation
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer();

  // a new name every time, so the file can be cached forever
  return savePhotoFile(folder, `${randomUUID()}.webp`, webp, { cacheControlMaxAge: 60 * 60 * 24 * 365 });
}

/** What Blob needs to delete a stored photo: the URL (public) or the pathname (private). Null = not a Blob photo. */
function toBlobTarget(url: string): string | null {
  const own = /^\/uploads\/([^/]+)\/([^/]+)$/.exec(url);
  if (own) return isUploadFolder(own[1]) ? blobPathname(own[1], own[2]) : null;
  try {
    return new URL(url).hostname.endsWith(".blob.vercel-storage.com") ? url : null;
  } catch {
    return null; // "/products/..." seed photos in public/
  }
}

/** Deletes photos from Blob. Other URLs are skipped. Never throws. */
export async function deleteProductImages(urls: (string | null | undefined)[]): Promise<void> {
  const targets = [...new Set(urls.filter((u): u is string => Boolean(u)))]
    .map(toBlobTarget)
    .filter((t): t is string => t !== null);
  if (targets.length === 0) return;
  try {
    await del(targets);
  } catch (err) {
    console.error("blob delete failed", err);
  }
}
