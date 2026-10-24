import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ShoePlaceholder } from "@/components/shelf/shoe-placeholder";
import { TYPE_ORDER } from "@/config/catalog.config";
import { PAGES } from "@/config/pages.config";
import { mainImage } from "@/lib/catalog";
import { t } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { ProductType, TypeSummary } from "@/types";

const href: Record<ProductType, string> = {
  TOP: `${PAGES.SHOWCASE}#rail`,
  BOTTOM: `${PAGES.SHOWCASE}#rail`,
  FOOTWEAR: `${PAGES.SHOWCASE}#footwear`,
};

const tint: Record<ProductType, string> = {
  TOP: "bg-[#ecebf0]",
  BOTTOM: "bg-[#e7e9ee]",
  FOOTWEAR: "bg-[#eeece8]",
};

/** "Верх / Низ / Обувь": one big tile for every product type. */
export function TypeTiles({ summary }: { summary: TypeSummary }) {
  const c = t.home.types;

  return (
    <section id="catalog" className="mx-auto mt-20 max-w-350 scroll-mt-6 px-6">
      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">{c.eyebrow}</p>
      <h2 className="mt-2 text-[clamp(26px,3.4vw,40px)] leading-none font-semibold tracking-[-0.04em] text-neutral-900">
        {c.title}
      </h2>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {TYPE_ORDER.map((type, i) => {
          const { count, cover } = summary[type];
          const photo = cover ? mainImage(cover) : null;
          const available = count > 0;
          const Tag = available ? Link : "div";

          return (
            <Tag
              key={type}
              href={href[type]}
              className={cn(
                "group relative block aspect-4/5 overflow-hidden rounded-[2rem] p-6 sm:p-7",
                tint[type],
                !available && "opacity-70",
              )}
            >
              <span className="text-[11px] tabular-nums text-neutral-400">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-1 text-3xl leading-none font-semibold tracking-[-0.04em] text-neutral-900">
                {t.catalog.types[type]}
              </h3>
              <p className="mt-2 max-w-[16rem] text-xs leading-relaxed text-neutral-500">{t.catalog.typeHints[type]}</p>

              {/* the photo stands on the bottom edge of the tile */}
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]",
                  type === "FOOTWEAR" ? "h-[52%] px-8 pb-10" : "h-[72%] px-6",
                )}
              >
                <div className="relative size-full">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={cover?.name ?? ""}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      unoptimized
                      className="object-contain object-bottom"
                    />
                  ) : type === "FOOTWEAR" ? (
                    <ShoePlaceholder className="absolute inset-0 size-full" />
                  ) : null}
                </div>
              </div>

              <div className="absolute inset-x-6 bottom-6 flex items-end justify-between sm:inset-x-7 sm:bottom-7">
                <span className="rounded-full bg-white/80 px-3 py-1.5 text-[11px] text-neutral-700 backdrop-blur">
                  {available ? c.count(count) : c.soon}
                </span>
                {available && (
                  <span className="grid size-10 place-items-center rounded-full bg-neutral-950 text-white transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="size-4" />
                  </span>
                )}
              </div>
            </Tag>
          );
        })}
      </div>
    </section>
  );
}
