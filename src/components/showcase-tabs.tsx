"use client";

import { useEffect, useState } from "react";
import { ProductShelf } from "@/components/shelf/product-shelf";
import { Storefront } from "@/components/storefront";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FootwearProduct, HangingProduct } from "@/types";

type Tab = "top" | "bottom" | "footwear";

type Props = {
  tops: HangingProduct[];
  bottoms: HangingProduct[];
  shoes: FootwearProduct[];
};

/**
 * One page, three tabs: upper clothes and lower clothes hang on a rail,
 * shoes stand on the shelf. Everything scrolls sideways.
 */
export function ShowcaseTabs({ tops, bottoms, shoes }: Props) {
  const [tab, setTab] = useState<Tab>("top");

  // a link like /showcase#footwear opens the shoes tab
  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#footwear") setTab("footwear");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const rails: { value: "top" | "bottom"; products: HangingProduct[]; empty: string }[] = [
    { value: "top", products: tops, empty: "Верхняя одежда скоро появится." },
    { value: "bottom", products: bottoms, empty: "Нижняя одежда скоро появится." },
  ];

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
      <div className="flex justify-center px-6 pt-3">
        <TabsList aria-label="Разделы витрины">
          <TabsTrigger value="top">
            Верхняя одежда
            <span className="tabular-nums opacity-60">{tops.length}</span>
          </TabsTrigger>
          <TabsTrigger value="bottom">
            Нижняя одежда
            <span className="tabular-nums opacity-60">{bottoms.length}</span>
          </TabsTrigger>
          <TabsTrigger value="footwear">
            Обувь
            <span className="tabular-nums opacity-60">{shoes.length}</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* the rail: tall enough for the hovered garment */}
      {rails.map(({ value, products, empty }) => (
        <TabsContent key={value} value={value} id="rail" className="scroll-mt-4 h-[max(520px,calc(100dvh-18rem))]">
          {products.length > 0 ? (
            <Storefront products={products} className="h-full" />
          ) : (
            <p className="pt-24 text-center text-sm text-neutral-400">{empty}</p>
          )}
        </TabsContent>
      ))}

      <TabsContent value="footwear" className="pt-6 pb-4">
        <ProductShelf products={shoes} />
      </TabsContent>
    </Tabs>
  );
}
