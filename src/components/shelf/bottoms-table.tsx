"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuickView } from "@/components/quick-view/quick-view-provider";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { discountPercent, mainImage, totalStock } from "@/lib/catalog";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { BottomProduct } from "@/types";

/**
 * The display table for bottoms: every pair lies folded on the table (a photo from above).
 * The row scrolls sideways, a click opens the same product card as the rail and the shelf.
 */
export function BottomsTable({ products, className }: { products: BottomProduct[]; className?: string }) {
  const quickView = useQuickView();
  const { ref, bind } = useDragScroll<HTMLUListElement>();
  // The pair that is open in the card disappears from the table until the card is closed.
  const [hiddenId, setHiddenId] = useState<string | null>(null);

  const open = (product: BottomProduct, rect: DOMRect) => {
    setHiddenId(product.id);
    quickView.open(
      product,
      { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      { onExited: () => setHiddenId(null) },
    );
  };

  return (
    <section id="bottoms" className={cn("scroll-mt-4", className)} aria-labelledby="bottoms-title">
      <div className="mx-auto max-w-350 px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Нижняя одежда</p>
            <h2
              id="bottoms-title"
              className="mt-2 text-[clamp(26px,3.4vw,40px)] font-semibold leading-none tracking-[-0.04em] text-neutral-900"
            >
              Стол с брюками
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-neutral-500">
            Листайте стол вбок, нажмите на стопку, чтобы рассмотреть вещь
          </p>
        </div>

        {products.length === 0 ? (
          <p className="mt-8 rounded-3xl bg-[#f1f0f3] px-6 py-16 text-center text-sm text-neutral-400">
            Нижняя одежда скоро появится.
          </p>
        ) : (
          // a warm tabletop, lit from above
          <div className="mt-8 rounded-[2rem] bg-[radial-gradient(120%_90%_at_50%_0%,#f8f6f2,#e8e4dd)] py-8 [--pants-w:clamp(220px,26vw,320px)]">
            <ul
              ref={ref}
              {...bind}
              aria-label="Нижняя одежда"
              className="scrollbar-none relative flex cursor-grab touch-pan-x gap-6 overflow-x-auto px-8 pb-2 select-none active:cursor-grabbing mask-[linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]"
            >
              {/* auto margins on the first and last pair: a short row is centred, a long one starts at the left */}
              {products.map((p) => (
                <li key={p.id} className="shrink-0 first:ml-auto last:mr-auto">
                  <PantsCard product={p} hidden={hiddenId === p.id} onOpen={open} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function PantsCard({
  product,
  hidden,
  onOpen,
}: {
  product: BottomProduct;
  hidden: boolean;
  onOpen: (product: BottomProduct, rect: DOMRect) => void;
}) {
  const photo = mainImage(product);
  const soldOut = totalStock(product) === 0;
  const discount = discountPercent(product);

  return (
    <button
      type="button"
      className="group block w-(--pants-w) cursor-pointer pt-4 text-left outline-none"
      onClick={(e) => onOpen(product, e.currentTarget.querySelector<HTMLElement>("[data-photo]")!.getBoundingClientRect())}
    >
      <div
        data-photo
        className={cn(
          "relative aspect-4/5 w-full origin-bottom transition duration-500 ease-out group-hover:-translate-y-2 group-hover:-rotate-1 group-hover:scale-[1.04] group-focus-visible:-translate-y-2 group-focus-visible:-rotate-1 group-focus-visible:scale-[1.04]",
          hidden && "opacity-0 transition-none",
          soldOut && "opacity-60",
        )}
      >
        {photo && (
          <Image
            src={photo}
            alt={product.name}
            fill
            sizes="320px"
            unoptimized
            draggable={false}
            // multiply: a photo with a white background melts into the tabletop, its own soft shadow stays
            className="object-contain mix-blend-multiply"
          />
        )}
      </div>

      <div className="mt-3 px-1 text-center">
        <p className="truncate text-[13px] font-medium text-neutral-900 group-focus-visible:underline">{product.name}</p>
        <p className="mt-0.5 flex items-center justify-center gap-1.5 text-xs tabular-nums text-neutral-500">
          {formatPrice(product.price)}
          {discount > 0 && (
            <span className="rounded-full bg-neutral-950 px-1.5 py-px text-[9px] font-medium text-white">
              {`−${discount}%`}
            </span>
          )}
        </p>
      </div>
    </button>
  );
}
