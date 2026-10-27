"use client";

import { useEffect, useState } from "react";
import { BottomsShelf } from "@/components/shelf/bottoms-shelf";
import { ProductShelf } from "@/components/shelf/product-shelf";
import { Storefront } from "@/components/storefront";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BottomProduct, FootwearProduct, TopProduct } from "@/types";

type Tab = "top" | "bottom" | "footwear";

type Props = {
  tops: TopProduct[];
  bottoms: BottomProduct[];
  shoes: FootwearProduct[];
};

/**
 * One page, three tabs: upper clothes hang on a rail, lower clothes stand as folded stacks on two long shelves,
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
      <TabsContent value="top" id="rail" className="scroll-mt-4 h-[max(520px,calc(100dvh-18rem))]">
        {tops.length > 0 ? (
          <Storefront products={tops} className="h-full" />
        ) : (
          <p className="pt-24 text-center text-sm text-neutral-400">Верхняя одежда скоро появится.</p>
        )}
      </TabsContent>

      <TabsContent value="bottom" className="pt-6 pb-4">
        <BottomsShelf products={bottoms} />
      </TabsContent>

      <TabsContent value="footwear" className="pt-6 pb-4">
        <ProductShelf products={shoes} />
      </TabsContent>
    </Tabs>
  );
}
