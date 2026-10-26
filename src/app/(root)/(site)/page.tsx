import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { TypeTiles } from "@/components/home/type-tiles";
import { featuredOf, mainImage, summarizeTypes } from "@/lib/catalog";
import { getProducts } from "@/lib/product-queries";

export const metadata: Metadata = {
  title: "Shimitsu · Главная",
  description: "Листайте рейл, наведите на вещь, чтобы развернуть её, нажмите, чтобы открыть.",
};

export default async function Home() {
  const products = await getProducts();
  // three featured things that have a photo go into the hero fan
  const picks = featuredOf(products, 8)
    .filter((p) => mainImage(p))
    .slice(0, 3);

  return (
    <>
      <Hero products={picks} />
      <Marquee />
      <TypeTiles summary={summarizeTypes(products)} />
    </>
  );
}
