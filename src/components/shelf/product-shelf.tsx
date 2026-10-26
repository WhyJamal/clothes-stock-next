"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuickView } from "@/components/quick-view/quick-view-provider";
import { SHELF_ROWS } from "@/config/catalog.config";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { discountPercent, totalStock } from "@/lib/catalog";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { FootwearProduct } from "@/types";
import { ShoePlaceholder } from "./shoe-placeholder";

type Props = {
  products: FootwearProduct[];
  className?: string;
};

/** Spreads the shoes over the rows one by one: 1st row, 2nd row, 3rd row, 1st row... */
function toRows<T>(items: T[], rows: number): T[][] {
  return Array.from({ length: Math.min(rows, items.length) }, (_, r) => items.filter((_, i) => i % rows === r));
}

/**
 * The shoe stand: three shelves, every shelf scrolls sideways on its own.
 * Clicking a pair opens the same product card as the rail.
 */
export function ProductShelf({ products, className }: Props) {
  const quickView = useQuickView();
  const rows = useMemo(() => toRows(products, SHELF_ROWS), [products]);
  // The pair that is open in the card disappears from the shelf until the card is closed.
  const [hiddenId, setHiddenId] = useState<string | null>(null);

  const open = (product: FootwearProduct, rect: DOMRect) => {
    setHiddenId(product.id);
    quickView.open(
      product,
      { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      { onExited: () => setHiddenId(null) },
    );
  };

  return (
    <section id="footwear" className={cn("scroll-mt-4", className)} aria-labelledby="footwear-title">
      <div className="mx-auto max-w-350 px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Обувь
            </p>
            <h2
              id="footwear-title"
              className="mt-2 text-[clamp(26px,3.4vw,40px)] font-semibold leading-none tracking-[-0.04em] text-neutral-900"
            >
              Стойка с обувью
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-neutral-500">Листайте ряды вбок, нажмите на пару, чтобы рассмотреть</p>
        </div>

        {rows.length === 0 ? (
          <p className="mt-8 rounded-3xl bg-[#f1f0f3] px-6 py-16 text-center text-sm text-neutral-400">
            Обувь скоро появится.
          </p>
        ) : (
          <div className="mt-8 space-y-3 rounded-[2rem] bg-[#f1f0f3] py-8 [--shoe-w:clamp(190px,24vw,300px)]">
            {rows.map((row, i) => (
              <ShelfRow key={i} label={`Ряд ${i + 1}`} products={row} hiddenId={hiddenId} onOpen={open} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ShelfRow({
  label,
  products,
  hiddenId,
  onOpen,
}: {
  label: string;
  products: FootwearProduct[];
  hiddenId: string | null;
  onOpen: (product: FootwearProduct, rect: DOMRect) => void;
}) {
  const { ref, bind } = useDragScroll<HTMLUListElement>();

  return (
    <div className="relative">
      {/* the board the shoes stand on */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-5 h-3.5 rounded-full bg-linear-to-b from-white to-[#e2e1e8] shadow-[0_14px_20px_-10px_rgba(30,30,60,0.35),inset_0_1px_0_rgba(255,255,255,0.9)]"
        style={{ top: "calc(1.75rem + var(--shoe-w) * 0.75 - 3px)" }}
      />

      <ul
        ref={ref}
        {...bind}
        aria-label={label}
        className="scrollbar-none relative flex cursor-grab touch-pan-x gap-6 overflow-x-auto px-8 pb-1 select-none active:cursor-grabbing mask-[linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]"
      >
        {/* auto margins on the first and last pair: a short row is centred, a long one starts at the left */}
        {products.map((p) => (
          <li key={p.id} className="shrink-0 first:ml-auto last:mr-auto">
            <ShoeCard product={p} hidden={hiddenId === p.id} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShoeCard({
  product,
  hidden,
  onOpen,
}: {
  product: FootwearProduct;
  hidden: boolean;
  onOpen: (product: FootwearProduct, rect: DOMRect) => void;
}) {
  const photo = product.images.side ?? product.images.front;
  const soldOut = totalStock(product) === 0;
  const discount = discountPercent(product);

  return (
    <button
      type="button"
      className="group block w-(--shoe-w) cursor-pointer pt-7 text-left outline-none"
      onClick={(e) => onOpen(product, e.currentTarget.querySelector<HTMLElement>("[data-photo]")!.getBoundingClientRect())}
    >
      <div
        data-photo
        className={cn(
          "relative aspect-4/3 w-full origin-bottom transition duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.06] group-focus-visible:-translate-y-2 group-focus-visible:scale-[1.06]",
          hidden && "opacity-0 transition-none",
          soldOut && "opacity-60",
        )}
      >
        {photo ? (
          <Image
            src={photo}
            alt={product.name}
            fill
            sizes="300px"
            unoptimized
            draggable={false}
            className="object-contain object-bottom drop-shadow-[0_10px_8px_rgba(20,20,40,0.18)]"
          />
        ) : (
          <ShoePlaceholder className="absolute inset-0 size-full" />
        )}
      </div>

      <div className="mt-6 px-1 text-center">
        <p className="truncate text-[13px] font-medium text-neutral-900 group-focus-visible:underline">
          {product.name}
        </p>
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
