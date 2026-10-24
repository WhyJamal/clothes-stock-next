"use client";

import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { t } from "@/lib/content";
import { useCart } from "./cart-provider";

export function CartButton() {
  const { count, openCart, cartButtonRef } = useCart();

  return (
    <button
      ref={cartButtonRef}
      onClick={openCart}
      aria-label={`${t.cart.title}, ${count} ${t.cart.items}`}
      className="relative cursor-pointer rounded-full p-1 text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
    >
      <ShoppingBag className="size-4" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-neutral-950 px-1 text-[9px] font-semibold leading-4 text-white"
            initial={{ scale: 0.4 }}
            animate={{ scale: [1.5, 1] }}
            transition={{ type: "spring", stiffness: 420, damping: 14 }}
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
