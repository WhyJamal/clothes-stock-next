import { notFound } from "next/navigation";
import { PageHeading } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminProduct } from "@/lib/admin-queries";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initial = await getAdminProduct(id);
  if (!initial) notFound();

  return (
    <>
      <PageHeading title={`Редактирование: ${initial.values.name}`} />
      {/* the key resets the form when the saved data comes back from the server */}
      <ProductForm key={JSON.stringify([initial.values, initial.sizes])} initial={initial} />
    </>
  );
}
