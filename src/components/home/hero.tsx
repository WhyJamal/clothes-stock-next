import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Storefront } from "@/components/storefront";
import { buttonVariants } from "@/components/ui/button";
import { PAGES } from "@/config/pages.config";
import { cn } from "@/lib/utils";
import type { HangingProduct } from "@/types";

/** Big headline over a live rail: it drifts by itself, hover turns a garment, a click opens it. */
export function Hero({ products }: { products: HangingProduct[] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-350 px-6 pt-10 sm:pt-16 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-14">
        <div>
          <h1 className="mt-5 text-[clamp(44px,8vw,120px)] leading-[0.93] font-semibold tracking-[-0.055em] text-balance text-neutral-900">
            Слои, которые{" "}
            <span className="bg-linear-to-r from-neutral-700 to-neutral-400 bg-clip-text text-transparent">
              сидят идеально.
            </span>
          </h1>
        </div>

        <div className="mt-6 max-w-sm lg:mb-3">
          <p className="text-sm leading-relaxed text-pretty text-neutral-500">Плотный футер, свободный крой и спокойные цвета. Наведите на вещь, и она повернётся лицом.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href={PAGES.SHOWCASE} className={cn(buttonVariants({ size: "lg" }), "rounded-full px-5")}>
              Смотреть витрину
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/#collection"
              className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "rounded-full px-5")}
            >
              Новинки
            </Link>
          </div>
        </div>
      </div>

      {products.length > 0 && (
        <Storefront products={products} drift={26} showBar={false} className="mt-2 h-110 sm:h-135" />
      )}
    </section>
  );
}
