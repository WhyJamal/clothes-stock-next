"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useQuickView } from "@/components/quick-view/quick-view-provider";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { usePressHold } from "@/hooks/use-press-hold";
import { discountPercent, mainImage, totalStock } from "@/lib/catalog";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { BottomProduct } from "@/types";

type Box = { left: number; top: number; width: number; height: number };

/** Where the big photo appears when the pointer is on a stack: it grows up from the stack. */
function previewBox(stack: DOMRect): Box {
  const width = Math.min(360, Math.max(240, stack.width * 1.5));
  const height = width * 1.2;
  const left = Math.min(window.innerWidth - width - 12, Math.max(12, stack.left + stack.width / 2 - width / 2));
  const top = Math.max(8, stack.bottom - height + 6);
  return { left, top, width, height };
}

/**
 * Two long shelves across the whole screen. The folded stacks are put on them one by one
 * (straight-on photos of the folded pair). A mouse on a stack shows the front of the pair bigger,
 * a click takes it off the shelf and opens the same product card as the rail and the shoe shelf.
 */
export function BottomsShelf({ products, className }: { products: BottomProduct[]; className?: string }) {
  const quickView = useQuickView();
  const rows = useMemo(
    () => [0, 1].map((r) => products.filter((_, i) => i % 2 === r)).filter((row) => row.length > 0),
    [products],
  );

  // the stacks are put on the shelf when the shelf comes into view
  const wallRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState(false);
  useEffect(() => {
    const el = wallRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlaced(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rows.length]);

  // The pair that is open in the card is missing from the shelf until the card is closed.
  const [hiddenId, setHiddenId] = useState<string | null>(null);
  const [hover, setHover] = useState<{ product: BottomProduct; box: Box } | null>(null);

  // the big photo is fixed to the screen: any scrolling (page or row) takes it away
  useEffect(() => {
    if (!hover) return;
    const clear = () => setHover(null);
    window.addEventListener("scroll", clear, true);
    return () => window.removeEventListener("scroll", clear, true);
  }, [hover]);

  const open = (product: BottomProduct, stack: DOMRect) => {
    setHover(null);
    setHiddenId(product.id);
    quickView.open(product, previewBox(stack), { onExited: () => setHiddenId(null) });
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
              Полка с брюками
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-neutral-500">
            Наведите на стопку (на телефоне удерживайте палец), чтобы увидеть вещь спереди, нажмите, чтобы открыть
          </p>
        </div>

        {rows.length === 0 && (
          <p className="mt-8 rounded-3xl bg-[#f1f0f3] px-6 py-16 text-center text-sm text-neutral-400">
            Нижняя одежда скоро появится.
          </p>
        )}
      </div>

      {rows.length > 0 && (
        // the wall: the shelves go from one edge of the screen to the other
        <div
          ref={wallRef}
          className="mt-8 space-y-2 border-y border-black/5 bg-[radial-gradient(120%_100%_at_50%_0%,#faf9fc,#ecebf1)] py-6 [--board-front:18px] [--board-top:14px] [--stack-w:clamp(150px,17vw,250px)]"
        >
          {rows.map((row, r) => (
            <ShelfRow
              key={r}
              label={`Полка ${r + 1}`}
              products={row}
              order={(p) => products.indexOf(p)}
              placed={placed}
              hiddenId={hiddenId}
              onHover={setHover}
              onOpen={open}
            />
          ))}
        </div>
      )}

      {hover && <BigPhoto key={hover.product.id} product={hover.product} box={hover.box} />}
    </section>
  );
}

function ShelfRow({
  label,
  products,
  order,
  placed,
  hiddenId,
  onHover,
  onOpen,
}: {
  label: string;
  products: BottomProduct[];
  order: (p: BottomProduct) => number;
  placed: boolean;
  hiddenId: string | null;
  onHover: (h: { product: BottomProduct; box: Box } | null) => void;
  onOpen: (product: BottomProduct, stack: DOMRect) => void;
}) {
  const { ref, bind } = useDragScroll<HTMLUListElement>();

  return (
    <ul ref={ref} {...bind} aria-label={label} className="scrollbar-none cursor-grab touch-pan-x overflow-x-auto select-none active:cursor-grabbing">
      {/* the inner box is as wide as the stacks, but never narrower than the screen: the board spans all of it */}
      <li className="relative flex w-max min-w-full list-none items-end gap-5 px-8 pt-4 pb-0">
        <Board />
        {products.map((p) => (
          <div key={p.id} className="shrink-0 pb-[calc(var(--board-front)+var(--board-top)*0)] first:ml-auto last:mr-auto">
            <Stack
              product={p}
              index={order(p)}
              placed={placed}
              hidden={hiddenId === p.id}
              onHover={onHover}
              onOpen={onOpen}
            />
          </div>
        ))}
      </li>
    </ul>
  );
}

/** A long shelf board: the top face you look down on and the front edge, with a soft shadow on the wall. */
function Board() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[calc(var(--board-front)+var(--board-top))]">
      <div className="absolute inset-x-0 -bottom-3 h-4 bg-linear-to-b from-neutral-900/15 to-transparent blur-[3px]" />
      <div
        className="absolute inset-x-0 top-0 h-(--board-top)"
        style={{ background: "linear-gradient(180deg,#ffffff,#e9e8ef)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-(--board-front)"
        style={{ background: "linear-gradient(180deg,#d6d4de,#bdbbc9)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }}
      />
    </div>
  );
}

function Stack({
  product,
  index,
  placed,
  hidden,
  onHover,
  onOpen,
}: {
  product: BottomProduct;
  index: number;
  placed: boolean;
  hidden: boolean;
  onHover: (h: { product: BottomProduct; box: Box } | null) => void;
  onOpen: (product: BottomProduct, stack: DOMRect) => void;
}) {
  const photoRef = useRef<HTMLDivElement>(null);
  const photo = product.images.folded ?? mainImage(product);
  const soldOut = totalStock(product) === 0;

  const show = () => {
    const r = photoRef.current?.getBoundingClientRect();
    if (r) onHover({ product, box: previewBox(r) });
  };

  // on a phone: holding a finger on the stack is the same as the mouse pointer resting on it
  const hold = usePressHold({ onStart: show, onEnd: () => onHover(null) });

  return (
    <div
      // put on the shelf one after another; once it stands, no transform is left (so the photo can melt into the wall)
      className={cn(
        "transition duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:transition-none",
        placed ? "translate-none rotate-none opacity-100" : "-translate-y-24 -rotate-3 opacity-0",
      )}
      style={{ transitionDelay: placed ? `${index * 110}ms` : "0ms" }}
    >
      <button
        type="button"
        {...hold}
        aria-label={`${product.name}, ${formatPrice(product.price)}`}
        onPointerEnter={(e) => e.pointerType === "mouse" && show()}
        onPointerLeave={() => onHover(null)}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && show()}
        onBlur={() => onHover(null)}
        onClick={() => photoRef.current && onOpen(product, photoRef.current.getBoundingClientRect())}
        className="relative block w-(--stack-w) cursor-pointer rounded-md outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
      >
        <div ref={photoRef} className={cn("relative aspect-5/4 w-full", hidden && "opacity-0", soldOut && "opacity-60")}>
          {/* where the stack touches the board */}
          <div className="absolute inset-x-[8%] -bottom-0.5 h-3 rounded-full bg-neutral-900/30 blur-[5px]" />
          {photo && (
            <Image
              src={photo}
              alt={product.name}
              fill
              sizes="250px"
              unoptimized
              draggable={false}
              // multiply: a photo with a white background melts into the wall
              // pointer-events-none: the finger touches the button, so the phone offers no "save image"
              className="pointer-events-none object-contain object-bottom mix-blend-multiply"
            />
          )}
        </div>
      </button>
    </div>
  );
}

/** The front of the pair, bigger: it grows up from the stack and is fixed to the screen. */
function BigPhoto({ product, box }: { product: BottomProduct; box: Box }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const src = product.images.front ?? mainImage(product);
  const discount = discountPercent(product);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed z-40 origin-bottom overflow-hidden rounded-3xl bg-white shadow-[0_40px_80px_-30px_rgba(30,30,60,0.55)] ring-1 ring-black/5 transition duration-300 ease-out motion-reduce:transition-none",
        shown ? "scale-100 opacity-100" : "scale-75 opacity-0",
      )}
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
    >
      {src && <Image src={src} alt="" fill sizes="360px" unoptimized className="object-cover" />}
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-full bg-white/85 px-3 py-1.5 text-[11px] backdrop-blur">
        <span className="truncate font-medium text-neutral-900">{product.name}</span>
        <span className="flex shrink-0 items-center gap-1.5 tabular-nums text-neutral-600">
          {formatPrice(product.price)}
          {discount > 0 && (
            <span className="rounded-full bg-neutral-950 px-1.5 py-px text-[9px] font-medium text-white">{`−${discount}%`}</span>
          )}
        </span>
      </div>
    </div>
  );
}
