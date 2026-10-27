"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart/cart-provider";
import { ShoePlaceholder } from "@/components/shelf/shoe-placeholder";
import { Button } from "@/components/ui/button";
import { DETAIL_VIEWS, LOW_STOCK } from "@/config/catalog.config";
import { STORE } from "@/config/store.config";
import { discountPercent, imageOf, isFootwear } from "@/lib/catalog";
import { CATEGORY_LABEL, GENDER_LABEL } from "@/lib/labels";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { AnyVariant, Product, ViewKey } from "@/types";

const VIEW_LABEL = { front: "Спереди", side: "Сбоку", back: "Сзади", folded: "Сложено" };
const VIEW_ORDER: ViewKey[] = ["front", "side", "back", "folded"];
const SIZE_LABEL = { TOP: "Размер", BOTTOM: "Размер (талия)", FOOTWEAR: "Размер (EU)" };

/** The product page: the photos (swipe them on a phone) on the left, the details and the size picker on the right. */
export function ProductView({ product }: { product: Product }) {
  const { add, openCart } = useCart();
  const footwear = isFootwear(product);
  const variants: AnyVariant[] = product.variants;

  // every photo the product has: the usual ones of its type first, then the rest
  const views = useMemo(() => {
    const first = DETAIL_VIEWS[product.type] as readonly ViewKey[];
    const rest = VIEW_ORDER.filter((v) => !first.includes(v));
    return [...first, ...rest].filter((v) => imageOf(product, v));
  }, [product]);

  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const onScroll = () => {
    const el = trackRef.current;
    if (el) setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  };
  const go = (i: number) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  // start on the first size that is in stock
  const [variantId, setVariantId] = useState<string | null>(() => variants.find((v) => v.stock > 0)?.id ?? null);
  const variant = variants.find((v) => v.id === variantId) ?? null;
  const soldOut = variants.every((v) => v.stock === 0);
  const discount = discountPercent(product);

  const onAdd = () => {
    if (!variant) return;
    add(product, variant);
    openCart();
  };

  return (
    // compact: the photo is as tall as the screen allows, so the photo and the details fit on one screen
    <div className="grid gap-6 md:grid-cols-[auto_minmax(320px,440px)] md:items-center md:justify-center md:gap-12 lg:gap-16">
      {/* photos: the small ones go in a column on the left of the big one (on a phone: in a row under it) */}
      <div className="flex min-w-0 flex-col items-center md:flex-row md:items-start md:gap-3">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className={cn(
            "scrollbar-none flex max-w-full snap-x snap-mandatory overflow-x-auto rounded-[2rem] bg-[#f1f0f3] md:order-2",
            footwear
              ? "aspect-4/3 w-full md:w-[min(560px,46vw)]"
              : "aspect-3/4 h-[50dvh] md:h-[min(calc(100dvh-12rem),640px)]",
          )}
        >
          {views.length === 0 ? (
            <div className="relative size-full shrink-0">
              <ShoePlaceholder className="absolute inset-0 size-full" />
            </div>
          ) : (
            views.map((v, i) => (
              <div key={v} className="relative size-full shrink-0 snap-center">
                <Image
                  src={imageOf(product, v)!}
                  alt={i === 0 ? product.name : `${product.name}, ${VIEW_LABEL[v].toLowerCase()}`}
                  fill
                  sizes="(min-width: 768px) 480px, 90vw"
                  unoptimized
                  priority={i === 0}
                  draggable={false}
                  // multiply: a photo with a white background melts into the panel; pointer-events-none: no "save image" menu
                  className="pointer-events-none object-contain p-3 mix-blend-multiply select-none [-webkit-touch-callout:none]"
                />
              </div>
            ))
          )}
        </div>

        {views.length > 1 && (
          <div role="tablist" aria-label="Фото" className="mt-3 flex gap-2 md:order-1 md:mt-0 md:flex-col">
            {views.map((v, i) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={index === i}
                aria-label={VIEW_LABEL[v]}
                onClick={() => go(i)}
                className={cn(
                  "relative aspect-3/4 w-12 cursor-pointer overflow-hidden rounded-lg bg-[#f1f0f3] outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-neutral-900 md:w-14",
                  index === i ? "ring-2 ring-neutral-900" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={imageOf(product, v)!}
                  alt=""
                  fill
                  sizes="56px"
                  unoptimized
                  draggable={false}
                  className="pointer-events-none object-contain p-1 mix-blend-multiply"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* details */}
      <div>
        <p className="text-[11px] text-neutral-400">
          {CATEGORY_LABEL[product.category]} · {GENDER_LABEL[product.gender]}
        </p>
        <h1 className="mt-2 text-[clamp(26px,3vw,38px)] leading-[1.05] font-semibold tracking-[-0.04em] text-neutral-900">
          {product.name}
        </h1>

        <div className="mt-3 flex items-baseline gap-2.5">
          <span className="text-xl font-medium tabular-nums text-neutral-900">{formatPrice(product.price)}</span>
          {discount > 0 && product.compareAtPrice && (
            <>
              <span className="text-sm tabular-nums text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
              <span className="rounded-full bg-neutral-950 px-2 py-0.5 text-[10px] font-medium text-white">{`−${discount}%`}</span>
            </>
          )}
        </div>

        {product.description && (
          <p className="mt-4 text-sm leading-relaxed text-neutral-500">{product.description}</p>
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
                type="button"
                role="radio"
                aria-checked={variantId === v.id}
                aria-label={out ? `${v.size}, нет в наличии` : v.size}
                disabled={out}
                onClick={() => setVariantId(v.id)}
                className={cn(
                  "grid h-10 min-w-10 cursor-pointer place-items-center rounded-full border px-2.5 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
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
          <p className="mt-2 text-xs text-neutral-500">{`Осталось ${variant.stock} шт.`}</p>
        )}

        <Button size="lg" className="mt-6 w-full rounded-full" onClick={onAdd} disabled={!variant}>
          {soldOut ? "Нет в наличии" : !variant ? "Выберите размер" : "В корзину"}
        </Button>

        <dl className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200 text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-neutral-500">Цвет</dt>
            <dd className="flex items-center gap-2 text-neutral-900">
              {product.colorHex && (
                <span aria-hidden className="size-3.5 rounded-full ring-1 ring-black/10" style={{ background: product.colorHex }} />
              )}
              {product.color}
            </dd>
          </div>
          {variant && (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-neutral-500">Артикул</dt>
              <dd className="tabular-nums text-neutral-900">{variant.sku}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-neutral-500">Доставка</dt>
            <dd className="text-right text-neutral-900">{`Бесплатно от ${formatPrice(STORE.freeShippingFrom)}`}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
