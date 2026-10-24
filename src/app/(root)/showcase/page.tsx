import { CartPanel } from "@/components/cart/cart-panel";
import { Storefront } from "@/components/storefront";
import { products } from "@/lib/products";
import { t } from "@/lib/content";

export default function Showcase() {
  return (
    <>
      <section className="shrink-0 px-6 pb-2 pt-6 text-center sm:pt-10">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-800">
          {t.hero.eyebrowA} <span className="mx-2 font-normal text-neutral-300">|</span>
          <span className="font-normal text-neutral-500">{t.hero.eyebrowB}</span>
        </p>
        <h1 className="mt-3 text-[clamp(30px,4.6vw,56px)] font-semibold leading-[1.05] tracking-[-0.04em] text-balance text-neutral-800">
          {t.hero.titleA}{" "}
          <span className="bg-linear-to-r from-neutral-600 to-neutral-400 bg-clip-text text-transparent">
            {t.hero.titleB}
          </span>
        </h1>
      </section>

      <Storefront products={products} className="min-h-0 flex-1" />
      <CartPanel />
    </>
  );
}
