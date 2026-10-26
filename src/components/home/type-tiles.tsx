import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ShoePlaceholder } from "@/components/shelf/shoe-placeholder";
import { TYPE_ORDER } from "@/config/catalog.config";
import { PAGES } from "@/config/pages.config";
import { mainImage } from "@/lib/catalog";
import { TYPE_HINT, TYPE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { ProductType, TypeSummary } from "@/types";

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

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
  return (
    <section id="catalog" className="mx-auto mt-20 max-w-350 scroll-mt-6 px-6">
      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Каталог</p>
      <h2 className="mt-2 text-[clamp(26px,3.4vw,40px)] leading-none font-semibold tracking-[-0.04em] text-neutral-900">
        Выберите слой
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
                {TYPE_LABEL[type]}
              </h3>
              <p className="mt-2 max-w-[16rem] text-xs leading-relaxed text-neutral-500">{TYPE_HINT[type]}</p>

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
                  {available ? `${count} ${plural(count, "модель", "модели", "моделей")}` : "Скоро в продаже"}
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
