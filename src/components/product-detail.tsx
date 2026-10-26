"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Loader2, X } from "lucide-react";
import { ShoePlaceholder } from "@/components/shelf/shoe-placeholder";
import { Button } from "@/components/ui/button";
import { DETAIL_VIEWS, LOW_STOCK } from "@/config/catalog.config";
import { discountPercent, imageOf, isFootwear } from "@/lib/catalog";
import { CATEGORY_LABEL, GENDER_LABEL } from "@/lib/labels";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { AnyVariant, Box, Product, ViewKey } from "@/types";

const VIEWS = { front: "Спереди", side: "Сбоку", back: "Сзади" };

const SIZE_LABEL = { TOP: "Размер", BOTTOM: "Размер (талия)", FOOTWEAR: "Размер (EU)" };

type Props = {
  product: Product;
  /** On-screen box of the product where it was clicked: the photo flies from here. */
  origin: Box;
  onClose: () => void;
  onAddToCart: (product: Product, variant: AnyVariant) => void;
};

const fly = { type: "spring", stiffness: 210, damping: 30 } as const;

export function ProductDetail({ product, origin, onClose, onAddToCart }: Props) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<Box | null>(null);
  const [adding, setAdding] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const footwear = isFootwear(product);
  const variants: AnyVariant[] = product.variants;

  // Photo tabs: the views this type uses, without the ones that have no photo yet.
  const views = useMemo(
    () => (DETAIL_VIEWS[product.type] as readonly ViewKey[]).filter((v) => imageOf(product, v)),
    [product],
  );
  const [view, setView] = useState<ViewKey | undefined>(views[0]);

  // Start on the first size that is in stock.
  const [variantId, setVariantId] = useState<string | null>(() => variants.find((v) => v.stock > 0)?.id ?? null);
  const variant = variants.find((v) => v.id === variantId) ?? null;
  const soldOut = variants.every((v) => v.stock === 0);
  const discount = discountPercent(product);

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
    if (adding || !variant) return;
    setAdding(true);
    timer.current = window.setTimeout(() => onAddToCart(product, variant), 800);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={product.name} className="fixed inset-0 z-50 overflow-hidden">
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
          <div
            ref={slotRef}
            className={cn(
              footwear
                ? "aspect-4/3 w-[min(88vw,460px)] md:w-[min(48vw,760px)]"
                : "aspect-3/4 h-[40dvh] md:h-[min(78dvh,820px)]",
            )}
          />
        </div>

        <motion.div
          className="w-full max-w-sm md:max-w-md md:justify-self-start"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.18, duration: 0.35 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          <p className="text-[11px] text-neutral-400">
            {CATEGORY_LABEL[product.category]} · {GENDER_LABEL[product.gender]}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">{product.name}</h2>

          <div className="mt-1 flex items-baseline gap-2 text-sm">
            <span className="font-medium tabular-nums text-neutral-900">{formatPrice(product.price)}</span>
            {discount > 0 && product.compareAtPrice && (
              <>
                <span className="text-xs tabular-nums text-neutral-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-neutral-950 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {`−${discount}%`}
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="mt-3 text-xs leading-relaxed text-neutral-500">{product.description}</p>
          )}

          {views.length > 1 && (
            <div role="tablist" aria-label="Фото" className="mt-5 flex gap-4 text-xs">
              {views.map((v) => (
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
                  {VIEWS[v]}
                  {view === v && (
                    <motion.span layoutId="photo-tab" className="absolute inset-x-0 bottom-0 h-px bg-neutral-900" />
                  )}
                </button>
              ))}
            </div>
          )}

          <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            {SIZE_LABEL[product.type]}
          </p>
          <div role="radiogroup" aria-label={SIZE_LABEL[product.type]} className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => {
              const out = v.stock === 0;
              return (
                <button
                  key={v.id}
                  role="radio"
                  aria-checked={variantId === v.id}
                  aria-label={out ? `${v.size}, нет в наличии` : v.size}
                  disabled={out}
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    "grid h-9 min-w-9 cursor-pointer place-items-center rounded-full border px-2 text-[11px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
                    variantId === v.id
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 text-neutral-700 hover:border-neutral-400",
                    out && "cursor-default text-neutral-300 line-through hover:border-neutral-200",
                  )}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
          {variant && variant.stock <= LOW_STOCK && (
            <p className="mt-2 text-[11px] text-neutral-500">{`Осталось ${variant.stock} шт.`}</p>
          )}

          <Button size="lg" className="mt-6 w-full rounded-full" onClick={add} disabled={adding || !variant}>
            {adding ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Добавляем…
              </>
            ) : soldOut ? (
              "Нет в наличии"
            ) : !variant ? (
              "Выберите размер"
            ) : (
              "В корзину"
            )}
          </Button>

          <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-600">
            <span>{product.color}</span>
            <a href="#" className="underline-offset-4 hover:underline">
              Страница товара
            </a>
          </div>
        </motion.div>
      </div>

      {/* the photo: flies from where it was clicked to the slot and back */}
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
          {views.length === 0 ? (
            <ShoePlaceholder className="absolute inset-0 size-full" />
          ) : (
            views.map((v) => (
              <motion.div
                key={v}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: view === v ? 1 : 0 }}
                // while closing, show the main photo again so it lands like the one it came from
                exit={{ opacity: v === views[0] ? 1 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <Image
                  src={imageOf(product, v)!}
                  alt={v === views[0] ? product.name : `${product.name}, ${VIEWS[v].toLowerCase()}`}
                  fill
                  sizes="(min-width: 768px) 760px, 90vw"
                  unoptimized
                  priority
                  draggable={false}
                  className="object-contain"
                />
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      <motion.div
        className="absolute right-5 top-5 z-70 md:right-8 md:top-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
      >
        <Button variant="outline" size="sm" className="rounded-none" onClick={onClose} autoFocus>
          Закрыть <X className="size-3.5" />
        </Button>
      </motion.div>
    </div>
  );
}
