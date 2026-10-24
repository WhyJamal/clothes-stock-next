"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { t } from "@/lib/content";
import { SIZES, formatPrice, type Product, type ProductView, type Size } from "@/lib/products";

export type Box = { left: number; top: number; width: number; height: number };

type Props = {
  product: Product;
  /** 0-based position of the product in the collection. */
  position: number;
  total: number;
  /** On-screen box of the garment on the rail: the photo flies from here. */
  origin: Box;
  onClose: () => void;
  onAddToCart: (product: Product, size: Size) => void;
};

const fly = { type: "spring", stiffness: 210, damping: 30 } as const;

export function ProductDetail({ product, position, total, origin, onClose, onAddToCart }: Props) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<Box | null>(null);
  const [view, setView] = useState<ProductView>("front");
  const [size, setSize] = useState<Size>("S");
  const [adding, setAdding] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // Where the photo has to land: the (invisible) slot in the layout.
  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setTarget({ left: r.left, top: r.top, width: r.width, height: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const add = () => {
    if (adding) return;
    setAdding(true);
    timer.current = window.setTimeout(() => onAddToCart(product, size), 800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* white sheet */}
      <motion.div
        className="absolute inset-0 bg-[#fbfafc]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.1 } }}
        transition={{ duration: 0.25 }}
      />

      {/* layout (the photo slot is invisible, the real photo flies into it) */}
      <div className="relative flex h-full flex-col items-center justify-center gap-6 px-6 pb-8 pt-16 md:grid md:grid-cols-[minmax(0,1.25fr)_minmax(320px,1fr)] md:gap-10 md:px-16 md:py-12">
        <div className="flex justify-center md:justify-end">
          <div ref={slotRef} className="aspect-3/4 h-[40dvh] md:h-[min(78dvh,820px)]" />
        </div>

        <motion.div
          className="w-full max-w-sm md:max-w-md md:justify-self-start"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.18, duration: 0.35 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          <p className="text-[11px] text-neutral-400">
            {position + 1} / {total}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">{product.name}</h2>
          <p className="mt-1 text-sm font-medium text-neutral-900">{formatPrice(product.price)}</p>

          <div role="tablist" aria-label={t.detail.photo} className="mt-5 flex gap-4 text-xs">
            {(["front", "back"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "relative cursor-pointer pb-1 text-neutral-400 transition-colors",
                  view === v && "text-neutral-900",
                )}
              >
                {v === "front" ? t.detail.front : t.detail.back}
                {view === v && (
                  <motion.span
                    layoutId="photo-tab"
                    className="absolute inset-x-0 bottom-0 h-px bg-neutral-900"
                  />
                )}
              </button>
            ))}
          </div>

          <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">{t.detail.size}</p>
          <div role="radiogroup" aria-label={t.detail.size} className="mt-2 flex gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={size === s}
                onClick={() => setSize(s)}
                className={cn(
                  "grid size-9 cursor-pointer place-items-center rounded-full border text-[11px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
                  size === s
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-400",
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <Button size="lg" className="mt-6 w-full rounded-full" onClick={add} disabled={adding}>
            {adding ? (
              <>
                <Loader2 className="size-4 animate-spin" /> {t.detail.adding}
              </>
            ) : (
              t.detail.add
            )}
          </Button>

          <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-600">
            <span>{product.name}</span>
            <a href="#" className="underline-offset-4 hover:underline">
              {t.detail.page}
            </a>
          </div>
        </motion.div>
      </div>

      {/* the photo: flies from the rail to the slot and back */}
      {target && (
        <motion.div
          className="pointer-events-none fixed z-60"
          initial={{ ...origin, opacity: 1 }}
          animate={{ ...target, opacity: 1 }}
          variants={{
            // `custom` is the cart icon box when adding to cart, null for a plain close.
            exit: (to: Box | null) => ({
              ...(to ?? origin),
              opacity: 0,
              transition: {
                default: to ? { type: "spring", stiffness: 150, damping: 24 } : fly,
                opacity: { delay: to ? 0.32 : 0.4, duration: 0.18 },
              },
            }),
          }}
          exit="exit"
          transition={fly}
        >
          {(["front", "back"] as const).map((v) => (
            <motion.div
              key={v}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: view === v ? 1 : 0 }}
              exit={{ opacity: v === "front" ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <Image
                src={product.images[v]}
                alt={v === "front" ? product.name : `${product.name}, ${t.detail.backAlt}`}
                fill
                sizes="(min-width: 768px) 640px, 60vw"
                unoptimized
                priority
                draggable={false}
                className="object-contain"
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        className="absolute right-5 top-5 z-70 md:right-8 md:top-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
      >
        <Button variant="outline" size="sm" className="rounded-none" onClick={onClose} autoFocus>
          {t.detail.close} <X className="size-3.5" />
        </Button>
      </motion.div>
    </div>
  );
}
