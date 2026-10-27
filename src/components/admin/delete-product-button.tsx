"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteProductAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/config/pages.config";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  name: string;
  /** "link" is the small text button in the table, "button" is the one on the edit page. */
  variant?: "link" | "button";
};

/** Asks for confirmation, deletes the product and its photos (Blob), then refreshes the list. */
export function DeleteProductButton({ id, name, variant = "button" }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (!window.confirm(`Удалить «${name}»? Товар, его остатки и фото будут удалены без возможности восстановления.`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteProductAction(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(PAGES.ADMIN_PRODUCTS);
      router.refresh();
    });
  }

  const icon = pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />;

  return (
    <>
      {variant === "link" ? (
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          title={error ?? undefined}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 text-xs underline underline-offset-4 disabled:opacity-50",
            error ? "text-destructive" : "text-neutral-500 hover:text-destructive",
          )}
        >
          {icon}
          Удалить
        </button>
      ) : (
        <Button type="button" variant="outline" onClick={remove} disabled={pending} className="rounded-full text-destructive">
          {icon}
          Удалить товар
        </Button>
      )}
      {variant === "button" && error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </>
  );
}
