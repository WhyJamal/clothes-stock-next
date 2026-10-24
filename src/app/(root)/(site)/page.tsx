import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { JoinCta } from "@/components/home/join-cta";
import { Marquee } from "@/components/home/marquee";
import { ProductCard } from "@/components/home/product-card";
import { TypeTiles } from "@/components/home/type-tiles";
import { Values } from "@/components/home/values";
import { PAGES } from "@/config/pages.config";
import { featuredOf, isHanging, summarizeTypes } from "@/lib/catalog";
import { t } from "@/lib/content";
import { getProducts } from "@/lib/product-queries";

export const metadata: Metadata = {
  title: t.home.metaTitle,
  description: t.meta.description,
};

export default async function Home() {
  const products = await getProducts();
  // whole rows of four only (a row with one lonely card looks broken)
  const picked = featuredOf(products, 8);
  const featured = picked.length >= 4 ? picked.slice(0, Math.floor(picked.length / 4) * 4) : picked;
  const { arrivals } = t.home;

  return (
    <>
      <Hero products={products.filter(isHanging)} />
      <Marquee />
      <TypeTiles summary={summarizeTypes(products)} />

      {/* collection */}
      <section id="collection" className="mx-auto mt-24 max-w-[1400px] scroll-mt-6 px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">{arrivals.eyebrow}</p>
            <h2 className="mt-2 text-[clamp(26px,3.4vw,40px)] leading-none font-semibold tracking-[-0.04em] text-neutral-900">
              {arrivals.title}
            </h2>
          </div>
          <Link
            href={PAGES.SHOWCASE}
            className="flex shrink-0 items-center gap-1.5 text-xs text-neutral-700 underline-offset-4 hover:underline"
          >
            {arrivals.all}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-3xl bg-[#f1f0f3] px-6 py-16 text-center text-sm text-neutral-400">
            {arrivals.empty}
          </p>
        )}
      </section>

      <Values />
      <JoinCta />
    </>
  );
}
