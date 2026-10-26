import Link from "next/link";
import { Search } from "lucide-react";
import { CartButton } from "@/components/cart/cart-button";
import { HeaderNav } from "@/components/header-nav";
import { UserButton, UtilityAuth } from "@/components/header-auth";
import { PAGES } from "@/config/pages.config";
import { HEADER } from "@/components/header.config";
import { STORE } from "@/config/store.config";

export function Header() {
  return (
    <header className="shrink-0">
      <div className="flex justify-end gap-3 bg-[#f1f0f3] px-6 py-1.5 text-[10px] text-neutral-600">
        {HEADER.utility.map(({ label, href }, i) => (
          <span key={label} className="contents">
            {i > 0 && <span className="text-neutral-300">|</span>}
            <a href={href}>{label}</a>
          </span>
        ))}
        <UtilityAuth />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-3">
        <Link href={PAGES.HOME} className="text-lg font-black tracking-tighter text-neutral-900">
          {STORE.name}
        </Link>
        <HeaderNav />
        <div className="col-start-3 flex items-center justify-end gap-4">
          <div className="hidden w-44 items-center gap-2 rounded-full bg-[#e9e8ec] px-4 py-2.5 text-xs text-neutral-500 sm:flex">
            <Search className="size-3.5 text-neutral-800" />
            Поиск
          </div>
          <UserButton />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
