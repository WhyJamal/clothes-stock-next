import { Search, User } from "lucide-react";
import { CartButton } from "@/components/cart/cart-button";
import { brand, t } from "@/lib/content";

export function SiteHeader() {
  return (
    <header className="shrink-0">
      <div className="flex justify-end gap-3 bg-[#f1f0f3] px-6 py-1.5 text-[10px] text-neutral-600">
        {t.header.utility.map((label, i) => (
          <span key={label} className="contents">
            {i > 0 && <span className="text-neutral-300">|</span>}
            <a href="#">{label}</a>
          </span>
        ))}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-3">
        <a href="#" className="text-lg font-black tracking-[-0.05em] text-neutral-900">
          {brand}
        </a>
        <nav className="hidden items-center gap-7 text-[11px] text-neutral-800 md:flex">
          {t.header.nav.map((label) => (
            <a key={label} href="#" className={label === t.header.navCurrent ? "font-semibold" : ""}>
              {label}
            </a>
          ))}
        </nav>
        <div className="col-start-3 flex items-center justify-end gap-4">
          <div className="hidden w-44 items-center gap-2 rounded-full bg-[#e9e8ec] px-4 py-2.5 text-xs text-neutral-500 sm:flex">
            <Search className="size-3.5 text-neutral-800" />
            {t.header.search}
          </div>
          <User className="size-4 text-neutral-900" />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
