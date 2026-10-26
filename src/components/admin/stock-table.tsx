"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, Minus, Plus, SlidersHorizontal } from "lucide-react";
import { LevelBadge } from "@/components/admin/level-badge";
import { StockDialog } from "@/components/admin/stock-dialog";
import { Input } from "@/components/ui/input";
import { TYPE_ORDER } from "@/config/catalog.config";
import { PAGES } from "@/config/pages.config";
import { stockLevel } from "@/lib/catalog";
import { CATEGORY_LABEL, TYPE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { ProductType, StockActionKind, StockLevel, StockRow } from "@/types";

const LEVELS = { all: "Любой остаток", low: "Мало", out: "Нет в наличии" };

type LevelFilter = "all" | Exclude<StockLevel, "ok">;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "cursor-pointer rounded-full px-3.5 py-1.5 text-xs transition-colors",
        active ? "bg-neutral-950 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:text-neutral-950",
      )}
    >
      {children}
    </button>
  );
}

export function StockTable({ rows }: { rows: StockRow[] }) {
  const router = useRouter();
  const [type, setType] = useState<ProductType | "ALL">("ALL");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [query, setQuery] = useState("");
  // balances changed in this session, shown at once; the server data catches up after router.refresh()
  const [changed, setChanged] = useState<Record<string, number>>({});
  const [dialog, setDialog] = useState<{ row: StockRow; kind: StockActionKind } | null>(null);

  const view = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .map((r) => ({ ...r, stock: changed[r.variantId] ?? r.stock }))
      .filter((r) => (type === "ALL" ? true : r.type === type))
      .filter((r) => (level === "all" ? true : stockLevel(r.stock) === level))
      .filter((r) => (q ? r.productName.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q) : true));
  }, [rows, changed, type, level, query]);

  const actions: { kind: StockActionKind; label: string; icon: typeof Plus }[] = [
    { kind: "RECEIPT", label: "Приход", icon: Plus },
    { kind: "ADJUSTMENT", label: "Корректировка", icon: SlidersHorizontal },
    { kind: "WRITE_OFF", label: "Списание", icon: Minus },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={type === "ALL"} onClick={() => setType("ALL")}>
          Все
        </Chip>
        {TYPE_ORDER.map((tp) => (
          <Chip key={tp} active={type === tp} onClick={() => setType(tp)}>
            {TYPE_LABEL[tp]}
          </Chip>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-neutral-200 sm:block" />
        {(["all", "low", "out"] as const).map((l) => (
          <Chip key={l} active={level === l} onClick={() => setLevel(l)}>
            {LEVELS[l]}
          </Chip>
        ))}
        <div className="ml-auto w-full sm:w-72">
          <Input
            type="search"
            aria-label="Поиск по названию или артикулу"
            placeholder="Поиск по названию или артикулу"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-3xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-neutral-100 text-[11px] uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Товар</th>
              <th className="px-4 py-3 font-medium">Размер</th>
              <th className="px-4 py-3 font-medium">Артикул</th>
              <th className="px-4 py-3 font-medium">Остаток</th>
              <th className="px-4 py-3 text-right font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {view.map((r) => (
              <tr key={r.variantId} className="hover:bg-neutral-50/60">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-[#f1f0f3]">
                      {r.photo && <Image src={r.photo} alt="" fill sizes="40px" unoptimized className="object-contain" />}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`${PAGES.ADMIN_PRODUCTS}/${r.productId}`}
                        className="block truncate font-medium text-neutral-900 hover:underline"
                      >
                        {r.productName}
                      </Link>
                      <span className="text-xs text-neutral-400">{CATEGORY_LABEL[r.category]}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 font-medium tabular-nums">{r.size}</td>
                <td className="px-4 py-2.5 text-xs text-neutral-500">{r.sku}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-base font-semibold tabular-nums text-neutral-900">{r.stock}</span>
                    <LevelBadge level={stockLevel(r.stock)} />
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    {actions.map(({ kind, label, icon: Icon }) => (
                      <button
                        key={kind}
                        type="button"
                        title={label}
                        aria-label={`${label}: ${r.productName} ${r.size}`}
                        onClick={() => setDialog({ row: r, kind })}
                        className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full px-2.5 text-xs text-neutral-700 ring-1 ring-neutral-200 transition-colors hover:bg-neutral-950 hover:text-white hover:ring-neutral-950"
                      >
                        <Icon className="size-3.5" />
                        <span className="hidden xl:inline">{label}</span>
                      </button>
                    ))}
                    <Link
                      href={`${PAGES.ADMIN_HISTORY}?variant=${r.variantId}`}
                      title="История"
                      aria-label={`История: ${r.productName} ${r.size}`}
                      className="inline-flex size-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                    >
                      <History className="size-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {view.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-neutral-400">
                  Ничего не найдено.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {dialog && (
        <StockDialog
          row={{ ...dialog.row, stock: changed[dialog.row.variantId] ?? dialog.row.stock }}
          kind={dialog.kind}
          onClose={() => setDialog(null)}
          onDone={(stock) => {
            setChanged((prev) => ({ ...prev, [dialog.row.variantId]: stock }));
            setDialog(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
