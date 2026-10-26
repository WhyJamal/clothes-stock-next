import { CATEGORIES_BY_TYPE, LOW_STOCK, SIZE_CHART, TYPE_ORDER } from "@/config/catalog.config";
import type {
  FootwearProduct,
  HangingProduct,
  Product,
  ProductCategory,
  ProductType,
  SizeOf,
  StockLevel,
  TypeSummary,
  ViewKey,
} from "@/types";

export const isHanging = (p: Product): p is HangingProduct => p.type !== "FOOTWEAR";
export const isFootwear = (p: Product): p is FootwearProduct => p.type === "FOOTWEAR";

/** Is `size` one of the sizes allowed for `type`? Narrows the size. */
export function isSizeOf<T extends ProductType>(type: T, size: string): size is SizeOf<T> {
  return (SIZE_CHART[type] as readonly string[]).includes(size);
}

export const sizesOf = <T extends ProductType>(type: T): readonly SizeOf<T>[] => SIZE_CHART[type];

/** Position of a size in its chart (for sorting). */
export const sizeIndex = (type: ProductType, size: string) =>
  (SIZE_CHART[type] as readonly string[]).indexOf(size);

export function categoryBelongsTo(type: ProductType, category: ProductCategory) {
  return (CATEGORIES_BY_TYPE[type] as readonly ProductCategory[]).includes(category);
}

/** The photo to show in lists: the front for clothes, the side for shoes. */
export function mainImage(p: Product): string | null {
  return isFootwear(p) ? (p.images.side ?? p.images.front ?? null) : p.images.front;
}

export const imageOf = (p: Product, view: ViewKey): string | null => p.images[view] ?? null;

export const totalStock = (p: Product) => p.variants.reduce((sum, v) => sum + v.stock, 0);

/** Discount in percent (0 when there is none). */
export const discountPercent = (p: Product) =>
  p.compareAtPrice && p.compareAtPrice > p.price
    ? Math.round((1 - p.price / p.compareAtPrice) * 100)
    : 0;

/** Count and a cover product for every type (the "Верх / Низ / Обувь" tiles). */
export function summarizeTypes(products: Product[]): TypeSummary {
  const summary = {} as TypeSummary;
  for (const type of TYPE_ORDER) {
    const ofType = products.filter((p) => p.type === type);
    summary[type] = { count: ofType.length, cover: ofType[0] ?? null };
  }
  return summary;
}

/** Products marked as featured; when none is marked, the first ones. */
export function featuredOf(products: Product[], limit = 8): Product[] {
  const featured = products.filter((p) => p.featured);
  return (featured.length > 0 ? featured : products).slice(0, limit);
}

/** "out" at 0, "low" up to LOW_STOCK pieces, otherwise "ok". */
export const stockLevel = (stock: number): StockLevel => (stock <= 0 ? "out" : stock <= LOW_STOCK ? "low" : "ok");
