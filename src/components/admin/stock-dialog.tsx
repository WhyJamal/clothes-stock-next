"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { stockAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StockActionKind, StockRow } from "@/types";

type Props = {
  row: StockRow;
  kind: StockActionKind;
  onClose: () => void;
  /** Called with the new balance after the server accepted the change. */
  onDone: (stock: number) => void;
};

const titles = {
  RECEIPT: "Приход товара",
  ADJUSTMENT: "Корректировка остатка",
  WRITE_OFF: "Списание",
} as const;

const qtyLabels = {
  RECEIPT: "Сколько пришло",
  ADJUSTMENT: "Фактический остаток",
  WRITE_OFF: "Сколько списать",
} as const;

/** One small form for the three warehouse operations. */
export function StockDialog({ row, kind, onClose, onDone }: Props) {
  const [qty, setQty] = useState(kind === "ADJUSTMENT" ? String(row.stock) : "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const n = qty.trim() === "" ? NaN : Number(qty);
  const valid = Number.isInteger(n) && n >= (kind === "ADJUSTMENT" ? 0 : 1);
  const next = !valid ? null : kind === "RECEIPT" ? row.stock + n : kind === "WRITE_OFF" ? row.stock - n : n;
  const tooMany = next !== null && next < 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return setError("Введите целое число от 0.");
    if (tooMany) return setError("Нельзя списать больше, чем есть на складе.");
    setError(null);

    startTransition(async () => {
      const res = await stockAction({ variantId: row.variantId, kind, qty: n, note });
      if (res.ok) onDone(res.stock);
      else setError(res.error);
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titles[kind]}
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/30 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-base font-semibold text-neutral-900">{titles[kind]}</h2>
        <p className="mt-1 text-xs text-neutral-500">
          {row.productName} · {row.size} · {row.sku}
        </p>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="qty" className="text-xs">
              {qtyLabels[kind]}
            </Label>
            <Input
              id="qty"
              type="number"
              min={kind === "ADJUSTMENT" ? 0 : 1}
              autoFocus
              value={qty}
              aria-invalid={Boolean(error)}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3 text-sm">
            <span className="text-neutral-500">
              Было: <b className="font-semibold text-neutral-900 tabular-nums">{row.stock}</b>
            </span>
            <span className="text-neutral-500">
              Станет:{" "}
              <b className={`font-semibold tabular-nums ${tooMany ? "text-destructive" : "text-neutral-900"}`}>
                {next ?? "—"}
              </b>
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-xs">
              Комментарий
            </Label>
            <Input id="note" value={note} maxLength={200} placeholder="Например: поставка от поставщика, пересчёт, брак" onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" className="rounded-full" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" className="rounded-full px-5" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Применяем…
              </>
            ) : (
              "Применить"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
