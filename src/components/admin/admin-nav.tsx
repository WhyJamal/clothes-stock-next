"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGES } from "@/config/pages.config";
import { cn } from "@/lib/utils";

const items = [
  { href: PAGES.ADMIN, label: "Обзор", exact: true },
  { href: PAGES.ADMIN_PRODUCTS, label: "Товары", exact: false },
  { href: PAGES.ADMIN_STOCK, label: "Склад", exact: true },
  { href: PAGES.ADMIN_HISTORY, label: "История", exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1 text-sm">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 transition-colors",
              active ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
