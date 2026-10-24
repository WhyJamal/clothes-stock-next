import { ProductCategory, ProductType } from "@/generated/prisma/enums";

/**
 * Valid sizes for every product type. The database keeps a size as a plain
 * string, this chart is the single source of truth for what is allowed.
 *   TOP      - letter sizes
 *   BOTTOM   - waist in inches
 *   FOOTWEAR - EU sizes
 */
export const SIZE_CHART = {
  [ProductType.TOP]: ["XS", "S", "M", "L", "XL", "XXL"],
  [ProductType.BOTTOM]: ["28", "30", "32", "34", "36", "38"],
  [ProductType.FOOTWEAR]: ["38", "39", "40", "41", "42", "43", "44", "45"],
} as const satisfies Record<ProductType, readonly string[]>;

/** Which categories live inside which type. */
export const CATEGORIES_BY_TYPE = {
  [ProductType.TOP]: [
    ProductCategory.T_SHIRT,
    ProductCategory.SHIRT,
    ProductCategory.SWEATSHIRT,
    ProductCategory.HOODIE,
    ProductCategory.KNITWEAR,
    ProductCategory.BLAZER,
    ProductCategory.JACKET,
    ProductCategory.COAT,
  ],
  [ProductType.BOTTOM]: [
    ProductCategory.JEANS,
    ProductCategory.TROUSERS,
    ProductCategory.CARGO,
    ProductCategory.JOGGERS,
    ProductCategory.SHORTS,
  ],
  [ProductType.FOOTWEAR]: [
    ProductCategory.SNEAKERS,
    ProductCategory.BOOTS,
    ProductCategory.LOAFERS,
    ProductCategory.SANDALS,
  ],
} as const satisfies Record<ProductType, readonly ProductCategory[]>;

// Compile-time check: if a category is added to schema.prisma but not listed above,
// the next line stops compiling.
type ListedCategory = (typeof CATEGORIES_BY_TYPE)[ProductType][number];
export const ALL_CATEGORIES_LISTED: ProductCategory extends ListedCategory ? true : never = true;

/** Order of the types in menus and on the home page. */
export const TYPE_ORDER = [ProductType.TOP, ProductType.BOTTOM, ProductType.FOOTWEAR] as const;

/** Types that hang on the rail. Footwear stands on the shelf. */
export const HANGING_TYPES = [ProductType.TOP, ProductType.BOTTOM] as const;

/** Photos shown in the product card, in tab order. Missing photos are skipped. */
export const DETAIL_VIEWS = {
  [ProductType.TOP]: ["front", "back"],
  [ProductType.BOTTOM]: ["front", "back"],
  [ProductType.FOOTWEAR]: ["side", "front", "back"],
} as const satisfies Record<ProductType, readonly ("front" | "side" | "back")[]>;

/** Shoe shelf: how many rows the shoes are spread over. */
export const SHELF_ROWS = 1;

/** A size with this stock or less is shown as "only N left". */
export const LOW_STOCK = 3;
