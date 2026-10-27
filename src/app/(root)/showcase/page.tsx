import type { Metadata } from "next";
import { ShowcaseTabs } from "@/components/showcase-tabs";
import { isBottom, isFootwear, isTop } from "@/lib/catalog";
import { getProducts } from "@/lib/product-queries";

export const metadata: Metadata = { title: "Shimitsu · Витрина", description: "Листайте рейл, наведите на вещь, чтобы развернуть её, нажмите, чтобы открыть." };

export default async function Showcase() {
  const products = await getProducts();
  const tops = products.filter(isTop);
  const bottoms = products.filter(isBottom);
  const shoes = products.filter(isFootwear);

  return (
    <>
      <section className="px-6 pb-2 pt-6 text-center sm:pt-10">
        <h1 className="mt-3 text-[clamp(30px,4.6vw,56px)] font-semibold leading-[1.05] tracking-[-0.04em] text-balance text-neutral-800">
          Слои, которые{" "}
          <span className="bg-linear-to-r from-neutral-600 to-neutral-400 bg-clip-text text-transparent">
            сидят идеально.
          </span>
        </h1>
      </section>

      <ShowcaseTabs tops={tops} bottoms={bottoms} shoes={shoes} />
    </>
  );
}
