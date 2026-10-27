"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useQuickView } from "@/components/quick-view/quick-view-provider";
import { PAGES } from "@/config/pages.config";
import { mainImage } from "@/lib/catalog";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

// Three places in the fan (left, middle, right): rotation and shift, closed → spread on hover.
const POSE = [
  "-rotate-6 -translate-x-[38%] group-hover/fan:-rotate-12 group-hover/fan:-translate-x-[58%]",
  "z-10 -translate-y-[3%] group-hover/fan:-translate-y-[7%]",
  "rotate-6 translate-x-[38%] group-hover/fan:rotate-12 group-hover/fan:translate-x-[58%]",
];
const TINT = ["bg-[#e7e9ee]", "bg-[#eeece8]", "bg-[#ecebf0]"];

function FanCard({ product, slot }: { product: Product; slot: number }) {
  const quickView = useQuickView();
  const ref = useRef<HTMLButtonElement>(null);
  const photo = mainImage(product);

  const open = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) quickView.open(product, { left: r.left, top: r.top, width: r.width, height: r.height });
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={open}
      className={cn(
        "absolute top-[8%] bottom-[8%] left-1/2 -ml-[23%] w-[46%] cursor-pointer overflow-hidden rounded-[2rem] text-left shadow-[0_28px_50px_-30px_rgba(30,30,60,0.55)] outline-none",
        "transition-[translate,rotate,scale] duration-500 ease-out hover:z-20 hover:scale-[1.05] focus-visible:ring-2 focus-visible:ring-neutral-900",
        TINT[slot],
        POSE[slot],
      )}
    >
      {photo && (
        <Image
          src={photo}
          alt={product.name}
          fill
          priority
          sizes="(min-width: 1024px) 22vw, 40vw"
          unoptimized
          className={cn("object-contain p-4 pb-16", product.type === "BOTTOM" && "mix-blend-multiply")}
        />
      )}
      <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-full bg-white/85 px-3 py-1.5 text-[11px] backdrop-blur">
        <span className="truncate font-medium text-neutral-900">{product.name}</span>
        <span className="shrink-0 tabular-nums text-neutral-600">{formatPrice(product.price)}</span>
      </span>
    </button>
  );
}

/** Up to three products in a fan: on hover the cards spread apart, a click opens the product. */
export function HeroFan({ products }: { products: Product[] }) {
  const slots = products.length === 1 ? [1] : products.length === 2 ? [0, 2] : [0, 1, 2];

  return (
    <div className="group/fan relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
      <div className="absolute inset-[5%] rounded-[3rem] bg-[#f1f0f3]" />

      {products.slice(0, 3).map((p, i) => (
        <FanCard key={p.id} product={p} slot={slots[i]} />
      ))}

      {/* a slowly turning badge that leads to the showcase */}
      <Link
        href={PAGES.SHOWCASE}
        aria-label="Смотреть витрину"
        className="absolute top-0 right-0 z-30 grid size-28 place-items-center rounded-full bg-neutral-950 text-white transition-transform duration-300 hover:scale-105"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full animate-[spin_18s_linear_infinite]" aria-hidden>
          <defs>
            <path id="hero-ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-white text-[8.5px] font-medium uppercase">
            <textPath href="#hero-ring" textLength="234" lengthAdjust="spacing">
              Новая коллекция • Осень — зима •
            </textPath>
          </text>
        </svg>
        <ArrowUpRight className="size-6" />
      </Link>
    </div>
  );
}
