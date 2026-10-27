import Image from "next/image";
import Link from "next/link";
import { ShoePlaceholder } from "@/components/shelf/shoe-placeholder";
import { productHref } from "@/config/pages.config";
import { discountPercent, mainImage } from "@/lib/catalog";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/types";

/** "More from the collection": other products of the same type. */
export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto mt-24 max-w-350 px-6" aria-labelledby="related-title">
      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Ещё из коллекции</p>
      <h2
        id="related-title"
        className="mt-2 text-[clamp(26px,3.4vw,40px)] leading-none font-semibold tracking-[-0.04em] text-neutral-900"
      >
        Вам может понравиться
      </h2>

      <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((p) => {
          const photo = mainImage(p);
          const discount = discountPercent(p);
          return (
            <li key={p.id}>
              <Link href={productHref(p.slug)} className="group block outline-none">
                <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] bg-[#f1f0f3] transition-colors group-hover:bg-[#e9e8ee] group-focus-visible:ring-2 group-focus-visible:ring-neutral-900">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={p.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      unoptimized
                      draggable={false}
                      className="object-contain p-6 mix-blend-multiply transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <ShoePlaceholder className="absolute inset-0 size-full" />
                  )}
                </div>
                <div className="mt-3 px-1">
                  <p className="truncate text-[13px] font-medium text-neutral-900 group-hover:underline group-focus-visible:underline underline-offset-4">
                    {p.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs tabular-nums text-neutral-500">
                    {formatPrice(p.price)}
                    {discount > 0 && (
                      <span className="rounded-full bg-neutral-950 px-1.5 py-px text-[9px] font-medium text-white">{`−${discount}%`}</span>
                    )}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
