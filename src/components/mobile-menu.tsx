"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { HEADER } from "@/components/header.config";
import { PAGES } from "@/config/pages.config";
import { STORE } from "@/config/store.config";
import { cn } from "@/lib/utils";

// true on the client, false while rendering on the server (the portal needs `document`)
const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

/** Hamburger button (below `md`) that opens a full-screen menu. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const pathname = usePathname();
  const { data, status } = useSession();
  const close = () => setOpen(false);

  // while the menu is open: the page behind does not scroll, Escape closes it,
  // and it closes by itself when the window becomes wide (phone turned sideways, tablet)
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const wide = window.matchMedia("(min-width: 768px)");
    const onWide = () => wide.matches && setOpen(false);

    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const authed = status === "authenticated";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть меню"
        aria-expanded={open}
        className="-ml-1 cursor-pointer rounded-full p-1 text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Меню"
                className="fixed inset-0 z-50 flex h-dvh flex-col bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] md:hidden"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between px-6 py-3">
                  <Link
                    href={PAGES.HOME}
                    onClick={close}
                    className="text-lg font-black tracking-tighter text-neutral-900"
                  >
                    {STORE.name}
                  </Link>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Закрыть меню"
                    className="cursor-pointer rounded-full p-1 text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-6 pt-8">
                  {HEADER.nav.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={close}
                      className={cn(
                        "py-1 text-4xl font-black tracking-tighter transition-colors",
                        href === pathname ? "text-neutral-950" : "text-neutral-400 active:text-neutral-950",
                      )}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>

                <div className="space-y-5 bg-[#f1f0f3] px-6 py-6">
                  {authed ? (
                    <div className="space-y-3">
                      <p className="truncate text-sm text-neutral-600">{data.user?.name ?? data.user?.email}</p>
                      <div className="flex flex-wrap gap-2">
                        {data.user?.role === "ADMIN" && (
                          <Link
                            href={PAGES.ADMIN}
                            onClick={close}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-900"
                          >
                            <LayoutDashboard className="size-4" />
                            Админка
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            close();
                            void signOut({ callbackUrl: PAGES.HOME });
                          }}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white"
                        >
                          <LogOut className="size-4" />
                          Выйти
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={PAGES.SIGNIN}
                        onClick={close}
                        className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white"
                      >
                        Войти
                      </Link>
                      <Link
                        href={PAGES.SIGNUP}
                        onClick={close}
                        className="rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900"
                      >
                        Присоединиться
                      </Link>
                    </div>
                  )}

                  <div className="flex gap-5 text-xs text-neutral-500">
                    {HEADER.utility.map(({ label, href }) => (
                      <a key={label} href={href} onClick={close}>
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
