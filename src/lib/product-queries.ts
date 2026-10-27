import { cacheLife, cacheTag } from "next/cache";
import { isSizeOf, sizeIndex } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import type { BottomProduct, Product, TopProduct, Variant, ViewKey } from "@/types";

/** Every cached query below carries this tag: call updateTag(PRODUCTS_TAG) after changing products. */
export const PRODUCTS_TAG = "products";

const include = { images: true, variants: true } satisfies Prisma.ProductInclude;
type Row = Prisma.ProductGetPayload<{ include: typeof include }>;

const orderBy = [{ sortOrder: "asc" }, { createdAt: "desc" }] satisfies Prisma.ProductOrderByWithRelationInput[];

/**
 * Database row -> the object the UI uses. Returns null for a row that breaks the rules
 * (clothes without a photo, a size that is not in the chart): such a product is skipped
 * instead of crashing the whole page.
 */
export function toProduct(row: Row): Product | null {
  const base = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    gender: row.gender,
    color: row.color,
    colorHex: row.colorHex,
    price: row.price.toNumber(),
    compareAtPrice: row.compareAtPrice ? row.compareAtPrice.toNumber() : null,
    featured: row.featured,
  };

  const images: Partial<Record<ViewKey, string>> = {};
  for (const img of row.images) images[img.view.toLowerCase() as ViewKey] = img.url;

  const variants = row.variants
    .filter((v) => isSizeOf(row.type, v.size))
    .sort((a, b) => sizeIndex(row.type, a.size) - sizeIndex(row.type, b.size))
    .map((v) => ({ id: v.id, sku: v.sku, size: v.size, stock: v.stock }));

  if (variants.length !== row.variants.length) {
    console.warn(`[products] ${row.slug}: some sizes are not valid for ${row.type}, they were skipped`);
  }
  if (variants.length === 0) return null;

  switch (row.type) {
    case "TOP":
      if (!images.front || !images.side || !images.back) break;
      return { ...base, type: "TOP", variants: variants as Variant<"TOP">[], images: images as TopProduct["images"] };
    case "BOTTOM":
      if (!images.front || !images.back) break;
      return {
        ...base,
        type: "BOTTOM",
        variants: variants as Variant<"BOTTOM">[],
        images: images as BottomProduct["images"],
      };
    case "FOOTWEAR":
      return { ...base, type: "FOOTWEAR", variants: variants as Variant<"FOOTWEAR">[], images };
  }

  console.warn(`[products] ${row.slug}: tops need front, side and back photos, bottoms need front and back, skipped`);
  return null;
}

const mapRows = (rows: Row[]) => rows.map(toProduct).filter((p): p is Product => p !== null);

/** All products that are for sale, in display order. */
export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("hours");

  const rows = await prisma.product.findMany({ where: { status: ProductStatus.ACTIVE }, include, orderBy });
  return mapRows(rows);
}
