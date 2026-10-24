import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers, Shirt, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PAGES } from "@/config/pages.config";
import { t } from "@/lib/content";
import { products, formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: t.home.metaTitle,
  description: t.meta.description,
};

const heroIds = ["green-hoodie", "black-blazer", "cream-sweatshirt"];
const heroProducts = heroIds.map((id) => products.find((p) => p.id === id)!);
const featured = products.slice(0, 4);
const featureIcons = [Layers, Shirt, ShieldCheck];

export default function Home() {
  const { hero, features, collection, cta } = t.home;

  return (
    <>
      {/* hero */}
      <section className="px-6 pb-4 pt-6 text-center sm:pt-12">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-800">
          {hero.eyebrowA} <span className="mx-2 font-normal text-neutral-300">|</span>
          <span className="font-normal text-neutral-500">{hero.eyebrowB}</span>
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-[clamp(30px,4.6vw,56px)] font-semibold leading-[1.05] tracking-[-0.04em] text-balance text-neutral-800">
          {hero.titleA}{" "}
          <span className="bg-linear-to-r from-neutral-600 to-neutral-400 bg-clip-text text-transparent">
            {hero.titleB}
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-pretty text-neutral-500">
          {hero.text}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href={PAGES.SHOWCASE} className={cn(buttonVariants({ size: "lg" }), "rounded-full px-5")}>
            {hero.primary}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href={PAGES.SIGNUP}
            className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "rounded-full px-5")}
          >
            {hero.secondary}
          </Link>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-3 items-end gap-3 sm:gap-6">
          {heroProducts.map((p, i) => (
            <Link
              key={p.id}
              href={PAGES.SHOWCASE}
              aria-label={p.name}
              className={cn(
                "relative block aspect-3/4 overflow-hidden rounded-2xl bg-[#f1f0f3] transition-transform duration-300 hover:-translate-y-1",
                i === 1 && "sm:-translate-y-4 sm:hover:-translate-y-5",
              )}
            >
              <Image
                src={p.images.front}
                alt={p.name}
                fill
                priority
                sizes="(min-width: 640px) 256px, 33vw"
                unoptimized
                className="object-contain object-bottom"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* why us */}
      <section className="mx-auto mt-16 grid max-w-6xl gap-4 px-6 md:grid-cols-3">
        {features.map(({ title, text }, i) => {
          const Icon = featureIcons[i];
          return (
            <Card key={title} className="bg-white py-6 shadow-none ring-neutral-200/70">
              <CardHeader>
                <span className="mb-2 grid size-9 place-items-center rounded-full bg-[#f1f0f3] text-neutral-800">
                  <Icon className="size-4" />
                </span>
                <CardTitle className="text-neutral-900">{title}</CardTitle>
                <CardDescription className="text-neutral-500">{text}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      {/* collection */}
      <section id="collection" className="mx-auto mt-20 max-w-6xl scroll-mt-6 px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              {collection.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-900">
              {collection.title}
            </h2>
          </div>
          <Link
            href={PAGES.SHOWCASE}
            className="flex shrink-0 items-center gap-1.5 text-xs text-neutral-700 underline-offset-4 hover:underline"
          >
            {collection.all}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {featured.map((p) => (
            <Link key={p.id} href={PAGES.SHOWCASE} className="group block">
              <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-[#f1f0f3]">
                <Image
                  src={p.images.front}
                  alt={p.name}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  unoptimized
                  className="object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-900">{p.name}</p>
              <div className="mt-0.5 flex items-center justify-between text-xs text-neutral-400">
                <span>{p.category}</span>
                <span className="font-medium tabular-nums text-neutral-900">{formatPrice(p.price)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* join */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="rounded-3xl bg-[#f1f0f3] px-6 py-12 text-center sm:py-16">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">{cta.eyebrow}</p>
          <h2 className="mx-auto mt-3 max-w-xl text-[clamp(22px,3vw,34px)] font-semibold leading-[1.1] tracking-[-0.03em] text-balance text-neutral-800">
            {cta.title}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500">{cta.text}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href={PAGES.SIGNUP} className={cn(buttonVariants({ size: "lg" }), "rounded-full px-5")}>
              {cta.primary}
            </Link>
            <Link
              href={PAGES.SIGNIN}
              className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "rounded-full px-5")}
            >
              {cta.secondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
