import { getAdmin } from "@/lib/admin";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, saveProductImage } from "@/lib/storage";

// POST multipart/form-data { file } -> { url }
export async function POST(req: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Нет доступа." }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Файл не получен." }, { status: 400 });

  if (!(ALLOWED_UPLOAD_TYPES as readonly string[]).includes(file.type)) {
    return Response.json({ error: "Подходят только PNG, JPG и WebP." }, { status: 415 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: "Файл больше 10 МБ." }, { status: 413 });
  }

  try {
    const url = await saveProductImage(Buffer.from(await file.arrayBuffer()));
    return Response.json({ url });
  } catch (err) {
    console.error("upload failed", err);
    return Response.json({ error: "Не удалось обработать изображение." }, { status: 422 });
  }
}
