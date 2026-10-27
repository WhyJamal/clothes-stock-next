"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  required?: boolean;
  /** Blob folder the photo goes to (the product type). */
  folder: "top" | "bottom" | "footwear";
  value?: string;
  error?: string;
  /** Tells the form that an upload is running, so it can not be saved half-way. */
  onBusy: (busy: boolean) => void;
  onChange: (url: string | undefined) => void;
};

// Vercel does not accept a request body over 4.5 MB, and phone photos are bigger than that.
// Big photos are shrunk in the browser first (max 1600px, WebP, transparency is kept).
const SHRINK_ABOVE = 3 * 1024 * 1024;

async function shrink(file: File): Promise<File> {
  if (file.size <= SHRINK_ABOVE) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/webp", 0.86));
    return blob ? new File([blob], `${file.name.replace(/\.\w+$/, "")}.webp`, { type: "image/webp" }) : file;
  } catch {
    return file;
  }
}

/** One photo: pick a file, it is uploaded at once (POST /api/admin/upload) and shown as a preview. */
export function ImageField({ label, required, folder, value, error, onBusy, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function upload(file: File) {
    setProblem(null);
    setBusy(true);
    onBusy(true);
    try {
      const body = new FormData();
      body.set("file", await shrink(file));
      body.set("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      if (res.status === 413) throw new Error("Файл слишком большой. Выберите фото поменьше.");
      // an error page of the platform is not JSON, so it must not crash the parsing
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Не удалось сохранить. Попробуйте ещё раз.");
      onChange(json.url);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : "Не удалось сохранить. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
      onBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const message = problem ?? error;

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-neutral-700">
        {label}
        {required && <span className="text-neutral-400"> *</span>}
      </p>

      <div
        className={cn(
          "relative aspect-4/5 overflow-hidden rounded-2xl border bg-[repeating-conic-gradient(#f1f0f3_0%_25%,#fff_0%_50%)] bg-size-[16px_16px]",
          message ? "border-destructive" : "border-neutral-200",
        )}
      >
        {value ? (
          <Image src={value} alt={label} fill sizes="240px" unoptimized className="object-contain p-2" />
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 text-xs text-neutral-500 hover:text-neutral-900"
          >
            <ImagePlus className="size-6" />
            Выбрать фото
          </button>
        )}

        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-white/70 text-xs text-neutral-600">
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Загружаем…
            </span>
          </div>
        )}
      </div>

      {value && !busy && (
        <div className="mt-2 flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
            Заменить
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            <X className="size-3.5" /> Убрать
          </Button>
        </div>
      )}

      {message && <p className="mt-1.5 text-xs text-destructive">{message}</p>}

      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
