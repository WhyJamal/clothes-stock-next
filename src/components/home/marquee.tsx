import { STORE } from "@/config/store.config";
import { t } from "@/lib/content";
import { formatPriceShort } from "@/lib/products";

/** A black line of short facts that scrolls without end. */
export function Marquee() {
  const items = [...t.home.marquee, t.home.marqueeShipping(formatPriceShort(STORE.freeShippingFrom))];

  // The list is printed twice and moved by exactly half its width, so the loop has no seam.
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((text) => (
        <li key={text} className="flex items-center whitespace-nowrap">
          <span className="px-6 text-[11px] font-medium uppercase tracking-[0.2em]">{text}</span>
          <span className="size-1 rounded-full bg-white/40" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mt-6 overflow-hidden bg-neutral-950 py-3.5 text-white">
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
