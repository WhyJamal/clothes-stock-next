"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
} from "motion/react";
import { ArrowRight } from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";
import { t } from "@/lib/content";
import { RailItem } from "./rail-item";
import {
  clamp,
  computeLayout,
  itemX,
  railPath,
  wrap,
  type RailLayout,
} from "./layout";

export type SelectInfo = {
  /** Index of the rendered item on the rail (not the product index). */
  itemIndex: number;
  /** On-screen box of the garment at the moment of the click. */
  rect: DOMRect;
};

type Props = {
  products: Product[];
  /** Called when a garment is clicked (not dragged). */
  onSelect?: (product: Product, info: SelectInfo) => void;
  /** Rendered item that is currently opened in the product detail (hidden on the rail). */
  hiddenIndex?: number | null;
  className?: string;
};

const CLICK_SLOP = 6; // px of movement that still counts as a click
const BOTTOM_BAR = 84; // px at the bottom that do not react to hover

export function SceneRail({ products, onSelect, hiddenIndex = null, className = "" }: Props) {
  const n = products.length;
  const rootRef = useRef<HTMLDivElement>(null);

  const [layout, setLayout] = useState<RailLayout>(() => computeLayout(1280, 720, n));
  const layoutMV = useMotionValue<RailLayout>(layout);

  // Shared motion values
  const scroll = useMotionValue(0);
  const pointerX = useMotionValue(-9999);
  const active = useSpring(0, { stiffness: 200, damping: 30 });
  const velocity = useVelocity(scroll);
  const swing = useSpring(useTransform(velocity, (v) => clamp(v * 0.006, -12, 12)), {
    stiffness: 90,
    damping: 7,
  });

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const pointer = useRef({ x: -9999, inside: false });
  const drag = useRef({ on: false, lastX: 0, moved: 0, id: -1 });
  const inertia = useRef<AnimationPlaybackControls | null>(null);
  const boxes = useRef(new Map<number, HTMLDivElement>());
  const registerBox = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) boxes.current.set(index, el);
    else boxes.current.delete(index);
  }, []);

  // Keep the layout in sync with the container size.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const next = computeLayout(width, height, n);
      layoutMV.set(next);
      setLayout(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [n, layoutMV]);

  /** Index of the garment closest to the pointer, or -1. */
  const nearest = useCallback(() => {
    if (!pointer.current.inside) return -1;
    const l = layoutMV.get();
    const s = scroll.get();
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < l.count; i++) {
      const d = Math.abs(itemX(i, s, l) - pointer.current.x);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return bestD < l.spacing * 0.5 ? best : -1;
  }, [layoutMV, scroll]);

  const refreshHover = useCallback(() => {
    const dragging = drag.current.on && drag.current.moved >= CLICK_SLOP;
    const i = dragging ? -1 : nearest();
    const id = i < 0 ? null : products[i % n].id;
    setHoveredId((prev) => (prev === id ? prev : id));
  }, [nearest, products, n]);

  // Items slide under a resting cursor while the rail inertia plays.
  useMotionValueEvent(scroll, "change", refreshHover);

  const updatePointer = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointer.current.x = x;
    pointer.current.inside = y < rect.height - BOTTOM_BAR;
    pointerX.set(x);
    active.set(pointer.current.inside && drag.current.moved < CLICK_SLOP ? 1 : 0);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    inertia.current?.stop();
    drag.current = { on: true, lastX: e.clientX, moved: 0, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePointer(e);
    refreshHover();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.on) {
      const dx = e.clientX - d.lastX;
      d.lastX = e.clientX;
      d.moved += Math.abs(dx);
      scroll.set(scroll.get() + dx);
    }
    updatePointer(e);
    refreshHover();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    if (e.currentTarget.hasPointerCapture(d.id)) e.currentTarget.releasePointerCapture(d.id);

    if (d.moved < CLICK_SLOP) {
      const i = nearest();
      const box = i >= 0 ? boxes.current.get(i) : undefined;
      if (i >= 0 && box) onSelect?.(products[i % n], { itemIndex: i, rect: box.getBoundingClientRect() });
    } else {
      inertia.current = animate(scroll, scroll.get(), {
        type: "inertia",
        velocity: scroll.getVelocity(),
        power: 0.7,
        timeConstant: 380,
        restDelta: 0.5,
      });
    }
    d.moved = 0;
    updatePointer(e);
  };

  const onPointerLeave = () => {
    if (drag.current.on) return;
    pointer.current.inside = false;
    active.set(0);
    setHoveredId(null);
  };

  const onWheel = (e: React.WheelEvent) => {
    inertia.current?.stop();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    scroll.set(scroll.get() - delta);
  };

  const hovered = useMemo(
    () => products.find((p) => p.id === hoveredId) ?? null,
    [products, hoveredId],
  );

  // Progress bar: where we are inside one full cycle of products.
  const thumbLeft = useTransform(() => {
    const l = layoutMV.get();
    const cycle = n * l.spacing;
    return `${(wrap(-scroll.get(), 0, cycle) / cycle) * 70}%`;
  });

  const items = useMemo(() => Array.from({ length: layout.count }, (_, i) => i), [layout.count]);
  const d = useMemo(() => railPath(layout), [layout]);

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={t.rail.label}
      className={`relative cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={onPointerLeave}
      onWheel={onWheel}
    >
      {/* rail */}
      <svg
        className="pointer-events-none absolute left-0 top-0"
        width={layout.width}
        height={layout.y0 + layout.sag + 30}
        fill="none"
      >
        <defs>
          <filter id="rail-blur" x="-5%" y="-200%" width="110%" height="500%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <path d={d} transform="translate(0 9)" stroke="rgba(20,20,40,0.16)" strokeWidth={9} filter="url(#rail-blur)" />
        <path d={d} stroke="#80828b" strokeWidth={8} strokeLinecap="round" />
        <path d={d} transform="translate(0 -0.5)" stroke="#b9bbc3" strokeWidth={5} strokeLinecap="round" />
        <path d={d} transform="translate(0 -1.6)" stroke="#f4f4f7" strokeWidth={1.8} strokeLinecap="round" />
      </svg>

      {/* garments */}
      {items.map((i) => (
        <RailItem
          key={i}
          index={i}
          product={products[i % n]}
          layout={layout}
          layoutMV={layoutMV}
          scroll={scroll}
          pointerX={pointerX}
          active={active}
          swing={swing}
          hidden={hiddenIndex === i}
          registerBox={registerBox}
          priority={i < n}
        />
      ))}

      {/* bottom bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-5 pb-5 sm:px-8 sm:pb-7">
        <div className="min-w-0 flex-1 text-[13px] leading-tight">
          {hovered ? (
            <>
              <p className="font-semibold text-neutral-900">{hovered.name}</p>
              <p className="mt-0.5 text-neutral-500">{formatPrice(hovered.price)}</p>
            </>
          ) : (
            <p className="text-xs text-neutral-400">{t.rail.hint}</p>
          )}
        </div>

        <div className="relative mb-1 h-0.75 w-28 shrink-0 rounded-full bg-neutral-200">
          <motion.div className="absolute top-0 h-full w-[30%] rounded-full bg-neutral-800" style={{ left: thumbLeft }} />
        </div>

        <div className="hidden min-w-0 flex-1 flex-col items-end gap-1.5 text-right text-xs sm:flex">
          <p className="max-w-52.5 font-semibold leading-snug text-neutral-900">
            {t.rail.blurb}
          </p>
          <span className="pointer-events-auto inline-flex items-center gap-1.5 border-b border-neutral-900 pb-px font-medium text-neutral-900">
            {t.rail.shop} <ArrowRight className="size-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
