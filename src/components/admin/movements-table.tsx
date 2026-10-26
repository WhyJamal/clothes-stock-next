import Link from "next/link";
import { PAGES } from "@/config/pages.config";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MovementRow } from "@/types";

const MOVEMENT = {
  INITIAL: "Начальный остаток",
  RECEIPT: "Приход",
  ADJUSTMENT: "Корректировка",
  WRITE_OFF: "Списание",
  SALE: "Продажа",
  RETURN: "Возврат",
};

/** The warehouse log. Server component: the dates are printed the same for everybody. */
export function MovementsTable({ rows, empty }: { rows: MovementRow[]; empty: string }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-neutral-100 text-[11px] uppercase tracking-wider text-neutral-400">
          <tr>
            {["Дата", "Товар", "Операция", "Изменение", "Остаток", "Комментарий", "Кто"].map((h) => (
              <th key={h} className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((m) => (
            <tr key={m.id}>
              <td className="px-4 py-2.5 text-xs whitespace-nowrap text-neutral-500">{formatDateTime(m.createdAt)}</td>
              <td className="px-4 py-2.5">
                <Link href={`${PAGES.ADMIN_PRODUCTS}/${m.productId}`} className="font-medium text-neutral-900 hover:underline">
                  {m.productName}
                </Link>
                <span className="ml-2 text-xs text-neutral-400">{m.size}</span>
              </td>
              <td className="px-4 py-2.5 text-xs whitespace-nowrap">{MOVEMENT[m.type]}</td>
              <td
                className={cn(
                  "px-4 py-2.5 font-semibold tabular-nums",
                  m.delta > 0 ? "text-emerald-700" : m.delta < 0 ? "text-red-700" : "text-neutral-500",
                )}
              >
                {m.delta > 0 ? `+${m.delta}` : m.delta}
              </td>
              <td className="px-4 py-2.5 tabular-nums">{m.balanceAfter}</td>
              <td className="max-w-56 truncate px-4 py-2.5 text-xs text-neutral-500" title={m.note ?? undefined}>
                {m.note ?? "—"}
              </td>
              <td className="px-4 py-2.5 text-xs whitespace-nowrap text-neutral-500">
                {m.userName ?? "система"}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-sm text-neutral-400">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
