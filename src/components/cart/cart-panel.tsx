"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isFootwear, mainImage } from "@/lib/catalog";
import { formatPrice } from "@/lib/products";
import { t } from "@/lib/content";
import { useCart } from "./cart-provider";

export function CartPanel() {
  const { lines, count, total, isOpen, closeCart, setQty, remove } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={t.cart.title}>
          <motion.div
            className="absolute inset-0 bg-neutral-950/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.08)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
          >
            <div className="flex items-center justify-between px-6 py-5">
              <h2 className="text-base font-semibold text-neutral-900">
                {t.cart.title} <span className="ml-1 text-xs font-normal text-neutral-400">({count})</span>
              </h2>
              <Button variant="ghost" size="icon" onClick={closeCart} aria-label={t.cart.close} autoFocus>
                <X className="size-4" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6">
              {lines.length === 0 ? (
                <p className="mt-16 text-center text-sm text-neutral-400">{t.cart.empty}</p>
              ) : (
                <ul>
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.key}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-[64px_1fr_auto] gap-4 border-t border-neutral-100 py-4">
                          <div className="relative h-20 w-16 overflow-hidden rounded-md bg-neutral-50">
                            {mainImage(line.product) && (
                              <Image
                                src={mainImage(line.product)!}
                                alt={line.product.name}
                                fill
                                sizes="64px"
                                unoptimized
                                className={isFootwear(line.product) ? "object-contain p-1" : "object-contain object-top"}
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-neutral-900">{line.product.name}</p>
                            <p className="mt-0.5 text-xs text-neutral-400">{t.cart.size} {line.variant.size}</p>
                            <div className="mt-3 inline-flex items-center rounded-full border border-neutral-200">
                              <button
                                aria-label={t.cart.decrease}
                                disabled={line.qty <= 1}
                                onClick={() => setQty(line.key, line.qty - 1)}
                                className="grid size-7 cursor-pointer place-items-center text-neutral-600 hover:text-neutral-950 disabled:cursor-default disabled:opacity-30"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="w-6 text-center text-xs tabular-nums">{line.qty}</span>
                              <button
                                aria-label={t.cart.increase}
                                disabled={line.qty >= line.variant.stock}
                                onClick={() => setQty(line.key, line.qty + 1)}
                                className="grid size-7 cursor-pointer place-items-center text-neutral-600 hover:text-neutral-950 disabled:cursor-default disabled:opacity-30"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-between">
                            <p className="text-sm font-medium tabular-nums text-neutral-900">
                              {formatPrice(line.product.price * line.qty)}
                            </p>
                            <button
                              aria-label={`${t.cart.remove}: ${line.product.name}`}
                              onClick={() => remove(line.key)}
                              className="cursor-pointer text-neutral-400 hover:text-neutral-900"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            <div className="border-t border-neutral-100 px-6 pb-6 pt-4">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-neutral-500">{t.cart.total}</span>
                <span className="font-semibold tabular-nums text-neutral-900">{formatPrice(total)}</span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">{t.cart.note}</p>
              <Button size="lg" className="mt-4 w-full rounded-full" disabled={lines.length === 0}>
                {t.cart.checkout}
              </Button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
