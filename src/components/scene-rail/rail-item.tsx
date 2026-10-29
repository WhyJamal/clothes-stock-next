"use client";

import Image from "next/image";
import { motion, useSpring, useTransform, type MotionValue } from "motion/react";
import { formatPriceShort } from "@/lib/products";
import type { TopProduct } from "@/types";
import {
  IMG_TOP,
  MAX_HOVER_SCALE,
  itemX,
  railY,
  smoothstep,
  type RailLayout,
} from "./layout";

type Props = {
  index: number;
  product: TopProduct;
  /** Current layout (for static sizes). */
  layout: RailLayout;
  /** Same layout as a motion value, so transforms can follow resizes. */
  layoutMV: MotionValue<RailLayout>;
  scroll: MotionValue<number>;
  pointerX: MotionValue<number>;
  active: MotionValue<number>;
  swing: MotionValue<number>;
  /** Hide the garment (it is currently shown in the product detail). */
  hidden?: boolean;
  /** Lets the rail read the on-screen box of the garment (for the open animation). */
  registerBox?: (index: number, el: HTMLDivElement | null) => void;
  priority?: boolean;
};

export function RailItem({
  index,
  product,
  layout,
  layoutMV,
  scroll,
  pointerX,
  active,
  swing,
  hidden = false,
  registerBox,
  priority,
}: Props) {
  // Position on the rail (x follows the looping scroll, y follows the sag).
  const x = useTransform(() => itemX(index, scroll.get(), layoutMV.get()));
  const y = useTransform(() => railY(x.get(), layoutMV.get()));

  // 0 = hanging sideways, 1 = turned to the front. Only the garment closest
  // to the cursor turns.
  const rawP = useTransform(() => {
    const l = layoutMV.get();
    const d = Math.abs(x.get() - pointerX.get());
    // Items are exactly `spacing` apart, so exactly one is closer than half a
    // spacing. The spring below turns this on/off into a smooth rotation.
    return d < 0.5 * l.spacing ? active.get() : 0;
  });
  const p = useSpring(rawP, { stiffness: 170, damping: 22, mass: 0.8 });

  // Neighbours step aside to make room for the enlarged garment.
  const rawPush = useTransform(() => {
    const l = layoutMV.get();
    const u = (x.get() - pointerX.get()) / (l.spacing * 0.9);
    return active.get() * l.spacing * 0.32 * u * Math.exp(0.5 - 0.5 * u * u);
  });
  const push = useSpring(rawPush, { stiffness: 170, damping: 24 });

  const scale = useTransform(p, (v) => 1 + (MAX_HOVER_SCALE - 1) * v);
  const zIndex = useTransform(p, (v) => Math.round(v * 20) + 1);

  // Two flat planes turn together like one object: the side view turns away
  // while the front view turns in, with a soft cross-fade in between.
  const sideRotate = useTransform(p, (v) => -v * 90);
  const frontRotate = useTransform(p, (v) => (1 - v) * 90);
  const sideOpacity = useTransform(p, (v) => 1 - smoothstep(0.55, 0.9, v));
  const frontOpacity = useTransform(p, (v) => smoothstep(0.2, 0.65, v));

  const { itemW, itemH } = layout;
  // The hook is drawn in the image: lift the image so its hook top sits on the rail.
  const imgTop = -IMG_TOP * itemH;
  const sizes = `${Math.round(itemW * 1.5)}px`;

  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0"
      style={{ x, y, zIndex }}
    >
      <motion.div style={{ x: push, rotate: swing, scale, transformOrigin: "0px 0px" }}>
        {/* garment */}
        <motion.div
          ref={(el) => registerBox?.(index, el)}
          className="absolute"
          style={{ left: -itemW / 2, top: imgTop, width: itemW, height: itemH, perspective: 900 }}
          initial={false}
          animate={{ opacity: hidden ? 0 : 1 }}
          transition={{ duration: hidden ? 0 : 0.25 }}
        >
          <motion.div className="absolute inset-0" style={{ rotateY: sideRotate, opacity: sideOpacity }}>
            <Image
              src={product.images.side}
              alt=""
              fill
              sizes={sizes}
              unoptimized
              priority={priority}
              draggable={false}
              className="object-contain"
            />
          </motion.div>
          <motion.div className="absolute inset-0" style={{ rotateY: frontRotate, opacity: frontOpacity }}>
            <Image
              src={product.images.front}
              alt={product.name}
              fill
              sizes={sizes}
              unoptimized
              priority={priority}
              draggable={false}
              className="object-contain"
            />
          </motion.div>
        </motion.div>

        {/* price tag */}
        <span
          className="absolute rounded-xs bg-white px-1.5 py-px text-[9px] font-semibold leading-none text-neutral-800 shadow-[0_1px_4px_rgba(0,0,0,0.18)]"
          style={{ left: 1, top: itemH * 0.03, transform: "rotate(-9deg)", transformOrigin: "0 0" }}
        >
          {formatPriceShort(product.price)}
        </span>
      </motion.div>
    </motion.div>
  );
}
