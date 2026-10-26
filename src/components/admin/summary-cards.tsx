import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { StockSummary } from "@/types";

export function SummaryCards({ summary }: { summary: StockSummary }) {
  const cards = [
    { label: "Единиц на складе", value: summary.units.toLocaleString("ru-RU"), tone: "" },
    { label: "Позиций (размеров)", value: String(summary.skus), tone: "" },
    { label: "Заканчиваются", value: String(summary.low), tone: summary.low > 0 ? "text-amber-700" : "" },
    { label: "Нет в наличии", value: String(summary.out), tone: summary.out > 0 ? "text-red-700" : "" },
    { label: "Стоимость остатка", value: formatPrice(summary.value), tone: "" },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-3xl border border-neutral-200 bg-white p-4 sm:p-5">
          <dt className="text-xs text-neutral-500">{c.label}</dt>
          <dd className={cn("mt-2 text-2xl font-semibold tracking-[-0.03em] tabular-nums text-neutral-900", c.tone)}>
            {c.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
