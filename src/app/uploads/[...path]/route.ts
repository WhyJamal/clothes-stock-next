import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_ROOT } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

// Serves the photos that were uploaded in the admin (see src/lib/storage.ts).
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  // only plain file names: no "..", no hidden files
  if (segments.some((s) => !/^[\w][\w.-]*$/.test(s))) return new Response("Not found", { status: 404 });

  const file = path.resolve(UPLOAD_ROOT, ...segments);
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type || !file.startsWith(UPLOAD_ROOT + path.sep)) return new Response("Not found", { status: 404 });

  try {
    const data = await fs.readFile(file);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
