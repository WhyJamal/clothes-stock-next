import { PageHeading } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProduct() {
  return (
    <>
      <PageHeading title="Новый товар" />
      <ProductForm />
    </>
  );
}
