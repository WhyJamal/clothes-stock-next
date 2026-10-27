import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductView } from "@/components/product/product-view";
import { RelatedProducts } from "@/components/product/related-products";
import { PAGES } from "@/config/pages.config";
import { STORE } from "@/config/store.config";
import { mainImage } from "@/lib/catalog";
import { CATEGORY_LABEL } from "@/lib/labels";
import { getProducts } from "@/lib/product-queries";

type Props = { params: Promise<{ slug: string }> };

async function findProduct(slug: string) {
  const products = await getProducts();
  return { products, product: products.find((p) => p.slug === slug) ?? null };
}

// The pages of the products that exist are built in advance. A product added later is rendered on the first visit.
export async function generateStaticParams() {
  const products = await getProducts();
  // the build needs at least one entry; this one is a 404
  return products.length > 0 ? products.map((p) => ({ slug: p.slug })) : [{ slug: "-" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await findProduct(slug);
  if (!product) return { title: `${STORE.name} · Товар не найден` };

  const title = `${product.name} · ${STORE.name}`;
  const description =
    product.description ?? `${CATEGORY_LABEL[product.category]} ${product.name} в магазине ${STORE.name}.`;
  const photo = mainImage(product);

  return {
    title,
    description,
    // a relative photo path would need metadataBase, so only full URLs go to the link preview
    openGraph: { title, description, ...(photo?.startsWith("http") ? { images: [photo] } : {}) },
  };
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-[70dvh]" />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: Props) {
  const { slug } = await params;
  const { products, product } = await findProduct(slug);
  if (!product) notFound();

  const related = products.filter((p) => p.type === product.type && p.id !== product.id).slice(0, 4);

  return (
    <>
      <section className="mx-auto max-w-350 px-6 pt-6 sm:pt-8">
        <Link
          href={PAGES.SHOWCASE}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Витрина
        </Link>
        <div className="mt-3">
          <ProductView product={product} />
        </div>
      </section>

      <RelatedProducts products={related} />
    </>
  );
}
