import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroFan } from "@/components/home/hero-fan";
import { buttonVariants } from "@/components/ui/button";
import { PAGES } from "@/config/pages.config";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/** Big headline on the left, a fan of three products on the right (no rail: that one lives on the showcase). */
export function Hero({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-350 px-6 pt-2 pb-4 sm:pt-3">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
        <div>
          <h1 className="mt-6 text-[clamp(42px,7vw,104px)] leading-[0.95] font-semibold tracking-[-0.055em] text-balance text-neutral-900">
            Одежда, которую{" "}
            <span className="inline-block -rotate-2 rounded-[0.25em] bg-neutral-950 px-[0.18em] pb-[0.06em] text-white">
              носят
            </span>{" "}
            каждый день.
          </h1>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-pretty text-neutral-500">
            Плотный футер, свободный крой и спокойные цвета. Три вещи, с которых стоит начать.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={PAGES.SHOWCASE} className={cn(buttonVariants({ size: "lg" }), "rounded-full px-5")}>
              Смотреть витрину
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/#catalog"
              className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "rounded-full px-5")}
            >
              Каталог
            </Link>
          </div>
        </div>

        {products.length > 0 && <HeroFan products={products} />}
      </div>
    </section>
  );
}
