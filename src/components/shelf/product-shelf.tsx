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
      <div className="mx-auto w-full">
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
          <div className="mt-8 space-y-2 py-8 bg-[radial-gradient(120%_80%_at_50%_0%,#f9f8fb,#eceaf1)] [--shoe-w:clamp(190px,24vw,300px)]">
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
    <ul
      ref={ref}
      {...bind}
      aria-label={label}
      className="scrollbar-none relative flex cursor-grab touch-pan-x gap-8 overflow-x-auto px-8 pb-2 select-none active:cursor-grabbing mask-[linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]"
    >
      {/* auto margins on the first and last pair: a short row is centred, a long one starts at the left */}
      {products.map((p) => (
        <li key={p.id} className="shrink-0 first:ml-auto last:mr-auto">
          <ShoeCard product={p} hidden={hiddenId === p.id} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  );
}

/** One pair on its own round pedestal: the shoe rises on hover and its shadow shrinks. */
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
      className="group block w-(--shoe-w) cursor-pointer pt-7 text-left outline-none [--ped-top:clamp(22px,2.4vw,30px)] [--sink:1.5]"
      onClick={(e) => onOpen(product, e.currentTarget.querySelector<HTMLElement>("[data-photo]")!.getBoundingClientRect())}
    >
      {/* the shoe */}
      <div
        data-photo
        className={cn(
          "relative z-20 aspect-4/3 w-full origin-bottom transition duration-500 ease-out group-hover:-translate-y-3 group-hover:scale-[1.05] group-focus-visible:-translate-y-3 group-focus-visible:scale-[1.05]",
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
            className="object-contain object-bottom"
          />
        ) : (
          <ShoePlaceholder className="absolute inset-0 size-full" />
        )}
      </div>

      {/* its own pedestal: a round top, a side with light and shade, a soft shadow on the floor */}
      <div aria-hidden className="relative z-10 mx-auto -mt-[calc(var(--ped-top)*var(--sink))] h-[calc(var(--ped-top)*2)] w-[86%]">
        <div className="absolute inset-x-[3%] -bottom-1.5 h-[calc(var(--ped-top)*0.8)] rounded-full bg-neutral-900/30 blur-md" />

        <div
          className="absolute inset-x-0 top-[calc(var(--ped-top)/2)] bottom-0"
          style={{
            background: "linear-gradient(90deg,#c9c7d3 0%,#f3f2f7 30%,#e4e3eb 62%,#c3c1ce 100%)",
            borderRadius: "0 0 50% 50% / 0 0 calc(var(--ped-top) / 2) calc(var(--ped-top) / 2)",
          }}
        />

        <div
          className="absolute inset-x-0 top-0 h-(--ped-top) rounded-[50%]"
          style={{
            background: "radial-gradient(ellipse at 50% 35%,#ffffff 0%,#f2f1f6 55%,#dddce5 100%)",
            boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(30,30,60,0.18)",
          }}
        >
          {/* where the shoe touches the pedestal */}
          <div
            className={cn(
              "absolute top-1/2 left-1/2 h-[48%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900/35 blur-[6px] transition duration-500 group-hover:scale-x-75 group-hover:opacity-50 group-focus-visible:scale-x-75 group-focus-visible:opacity-50",
              hidden && "opacity-0 transition-none",
            )}
          />
        </div>
      </div>

      <div className="mt-5 px-1 text-center">
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
