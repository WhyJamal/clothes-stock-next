import { cn } from "@/lib/utils";
import type { StockLevel } from "@/types";

const LEVEL = { ok: "В наличии", low: "Мало", out: "Нет в наличии" };

const style: Record<StockLevel, string> = {
  ok: "bg-emerald-50 text-emerald-700",
  low: "bg-amber-50 text-amber-700",
  out: "bg-red-50 text-red-700",
};

export function LevelBadge({ level }: { level: StockLevel }) {
  return (
    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", style[level])}>
      {LEVEL[level]}
    </span>
  );
}
