import { get } from "@vercel/blob";
import { blobPathname, isUploadFolder } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const notFound = () => new Response("Not found", { status: 404 });

// Serves the product photos from the private Blob store: /uploads/<top|bottom|footwear>/<file>.
// The photos are public for the shop visitors; only the Blob store itself is private.
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const [folder, file, ...rest] = segments;

  // exactly folder/file, and only plain file names: no "..", no hidden files
  if (rest.length > 0 || !isUploadFolder(folder) || !file || !/^[\w][\w.-]*$/.test(file)) return notFound();
  const type = TYPES[file.slice(file.lastIndexOf(".")).toLowerCase()];
  if (!type) return notFound();

  let result;
  try {
    result = await get(blobPathname(folder, file), {
      access: "private",
      ifNoneMatch: req.headers.get("if-none-match") ?? undefined,
    });
  } catch (err) {
    console.error("photo read failed", err);
    return new Response("Failed to load the photo", { status: 500 });
  }
  if (!result) return notFound();

  const headers = {
    ETag: result.blob.etag,
    "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  };
  if (result.statusCode === 304) return new Response(null, { status: 304, headers });
  return new Response(result.stream, { headers: { ...headers, "Content-Type": type } });
}
