import Link from "next/link";
import { LevelBadge } from "@/components/admin/level-badge";
import { MovementsTable } from "@/components/admin/movements-table";
import { PageHeading } from "@/components/admin/admin-shell";
import { SummaryCards } from "@/components/admin/summary-cards";
import { PAGES } from "@/config/pages.config";
import { getMovements, getStockRows, summarizeStock } from "@/lib/admin-queries";
import { stockLevel } from "@/lib/catalog";

export const instant = false;

export default async function AdminHome() {  
  const [rows, movements] = await Promise.all([getStockRows(), getMovements({ limit: 8 })]);
  const needs = rows
    .filter((r) => stockLevel(r.stock) !== "ok")
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  return (
    <>
      <PageHeading title="Обзор" />
      <SummaryCards summary={summarizeStock(rows)} />

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Нужно пополнить</h2>
          <Link href={PAGES.ADMIN_STOCK} className="text-xs text-neutral-600 underline-offset-4 hover:underline">
            Склад
          </Link>
        </div>
        {needs.length === 0 ? (
          <p className="rounded-3xl border border-neutral-200 bg-white px-5 py-8 text-center text-sm text-neutral-400">
            Всё в порядке: нет позиций с малым остатком.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100 rounded-3xl border border-neutral-200 bg-white">
            {needs.map((r) => (
              <li key={r.variantId} className="flex items-center gap-3 px-5 py-3 text-sm">
                <span className="min-w-0 flex-1 truncate font-medium text-neutral-900">{r.productName}</span>
                <span className="text-neutral-500 tabular-nums">{r.size}</span>
                <span className="w-8 text-right font-semibold tabular-nums">{r.stock}</span>
                <LevelBadge level={stockLevel(r.stock)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Последние движения</h2>
          <Link href={PAGES.ADMIN_HISTORY} className="text-xs text-neutral-600 underline-offset-4 hover:underline">
            Все
          </Link>
        </div>
        <MovementsTable rows={movements} empty="Пока нет движений." />
      </section>
    </>
  );
}
