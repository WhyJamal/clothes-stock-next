import { PageHeading } from "@/components/admin/admin-shell";
import { StockTable } from "@/components/admin/stock-table";
import { SummaryCards } from "@/components/admin/summary-cards";
import { getStockRows, summarizeStock } from "@/lib/admin-queries";

export const instant = false;

export default async function AdminStock() {
  const rows = await getStockRows();

  return (
    <>
      <PageHeading title="Склад" />
      <SummaryCards summary={summarizeStock(rows)} />
      <div className="mt-8">
        <StockTable rows={rows} />
      </div>
    </>
  );
}
