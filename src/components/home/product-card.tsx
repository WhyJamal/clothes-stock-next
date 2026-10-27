"use client";

import { useRef } from "react";
import Image from "next/image";
import { ShoePlaceholder } from "@/components/shelf/shoe-placeholder";
import { useQuickView } from "@/components/quick-view/quick-view-provider";
import { discountPercent, isFootwear, mainImage, totalStock } from "@/lib/catalog";
import { CATEGORY_LABEL } from "@/lib/labels";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/** A product in a grid. Hover shows the other side, a click opens the product card. */
export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const quickView = useQuickView();
  const photoRef = useRef<HTMLDivElement>(null);

  const first = mainImage(product);
  // The photo shown on hover: the back of clothes, the front of shoes.
  const second = isFootwear(product) ? (product.images.front ?? null) : product.images.back;
  const discount = discountPercent(product);
  const soldOut = totalStock(product) === 0;

  const open = () => {
    const r = photoRef.current?.getBoundingClientRect();
    if (r) quickView.open(product, { left: r.left, top: r.top, width: r.width, height: r.height });
  };

  // a bottom photo may have a white background: multiply melts it into the tile
  const imageClass = cn("object-contain p-3 transition-opacity duration-500", product.type === "BOTTOM" && "mix-blend-multiply");

  return (
    <button type="button" onClick={open} className="group block w-full cursor-pointer text-left outline-none">
      <div
        ref={photoRef}
        className={cn(
          "relative aspect-4/5 overflow-hidden rounded-3xl bg-[#f1f0f3] transition-shadow duration-300 group-hover:shadow-[0_18px_40px_-24px_rgba(30,30,60,0.45)] group-focus-visible:ring-2 group-focus-visible:ring-neutral-900",
          soldOut && "opacity-60",
        )}
      >
        {first ? (
          <Image
            src={first}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 768px) 25vw, 50vw"
            unoptimized
            className={cn(imageClass, second && "group-hover:opacity-0")}
          />
        ) : (
          <ShoePlaceholder className="absolute inset-0 size-full p-8" />
        )}
        {first && second && (
          <Image
            src={second}
            alt=""
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            unoptimized
            className={cn(imageClass, "opacity-0 group-hover:opacity-100")}
          />
        )}

        <div className="absolute left-3 top-3 flex gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-neutral-950 px-2 py-1 text-[10px] font-medium text-white">
              {`−${discount}%`}
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-neutral-600">
              Нет в наличии
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-neutral-400">{CATEGORY_LABEL[product.category]}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-neutral-900">{product.name}</p>
      <p className="mt-0.5 flex items-baseline gap-2 text-xs tabular-nums text-neutral-900">
        {formatPrice(product.price)}
        {discount > 0 && product.compareAtPrice && (
          <span className="text-neutral-400 line-through">{formatPrice(product.compareAtPrice)}</span>
        )}
      </p>
    </button>
  );
}
