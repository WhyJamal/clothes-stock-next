export const instant = false;

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { LevelBadge } from "@/components/admin/level-badge";
import { PageHeading } from "@/components/admin/admin-shell";
import { buttonVariants } from "@/components/ui/button";
import { PAGES } from "@/config/pages.config";
import { getAdminProducts } from "@/lib/admin-queries";
import { stockLevel } from "@/lib/catalog";
import { CATEGORY_LABEL, STATUS_LABEL, TYPE_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/types";

const statusStyle: Record<ProductStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-neutral-100 text-neutral-600",
  ARCHIVED: "bg-neutral-100 text-neutral-400",
};

export default async function AdminProducts() {
  const products = await getAdminProducts();

  return (
    <>
      <PageHeading title="Товары">
        <Link
          href={PAGES.ADMIN_NEW_PRODUCT}
          className={cn(
            buttonVariants({ size: "default" }),
            "rounded-full px-5",
          )}
        >
          <Plus className="size-4" />
          Добавить товар
        </Link>
      </PageHeading>

      <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white">
        <table className="w-full min-w-190 text-left text-sm">
          <thead className="border-b border-neutral-100 text-[11px] uppercase tracking-wider text-neutral-400">
            <tr>
              {["Товар", "Тип", "Статус", "Цена", "Остаток", "Обновлён"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ),
              )}
              <th />
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50/60">
                <td className="px-4 py-2.5">
                  <Link
                    href={`${PAGES.ADMIN_PRODUCTS}/${p.id}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-[#f1f0f3]">
                      {p.photo && (
                        <Image
                          src={p.photo}
                          alt=""
                          fill
                          sizes="44px"
                          unoptimized
                          className="object-contain"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="block truncate font-medium text-neutral-900">
                        {p.name}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {p.slug}
                      </span>
                    </div>
                  </Link>
                </td>

                <td className="px-4 py-2.5 text-xs text-neutral-600">
                  {TYPE_LABEL[p.type]} ·{" "}
                  {CATEGORY_LABEL[p.category]}
                </td>

                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      statusStyle[p.status],
                    )}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>

                <td className="px-4 py-2.5 tabular-nums whitespace-nowrap">
                  {formatPrice(p.price)}
                </td>

                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">
                      {p.totalStock}
                    </span>
                    <LevelBadge level={stockLevel(p.totalStock)} />
                  </div>
                </td>

                <td className="px-4 py-2.5 text-xs whitespace-nowrap text-neutral-500">
                  {formatDateTime(p.updatedAt)}
                </td>

                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`${PAGES.ADMIN_PRODUCTS}/${p.id}`}
                      className="text-xs text-neutral-900 underline underline-offset-4"
                    >
                      Изменить
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} variant="link" />
                  </div>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-neutral-400"
                >
                  Товаров пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
