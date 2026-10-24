"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/content";

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-7 text-[11px] text-neutral-800 md:flex">
      {t.header.nav.map(({ label, href }) => (
        <Link key={label} href={href} className={href === pathname ? "font-semibold" : ""}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
