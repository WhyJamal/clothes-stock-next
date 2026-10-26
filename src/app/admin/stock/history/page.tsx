import Link from "next/link";
import { MovementsTable } from "@/components/admin/movements-table";
import { PageHeading } from "@/components/admin/admin-shell";
import { PAGES } from "@/config/pages.config";
import { getMovements } from "@/lib/admin-queries";

export const instant = false;

export default async function AdminHistory({ searchParams }: { searchParams: Promise<{ variant?: string }> }) {
  const { variant } = await searchParams;
  const rows = await getMovements({ variantId: variant, limit: 300 });

  return (
    <>
      <PageHeading title="История движений">
        {variant && (
          <p className="text-xs text-neutral-500">
            Показаны движения одного размера.{" "}
            <Link href={PAGES.ADMIN_HISTORY} className="text-neutral-900 underline underline-offset-4">
              Показать все
            </Link>
          </p>
        )}
      </PageHeading>
      <MovementsTable rows={rows} empty="Движений пока нет." />
    </>
  );
}
