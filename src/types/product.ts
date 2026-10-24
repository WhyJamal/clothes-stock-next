import type {
  Gender,
  ImageView,
  ProductCategory,
  ProductStatus,
  ProductType,
} from "@/generated/prisma/enums";
import type { HANGING_TYPES, SIZE_CHART } from "@/config/catalog.config";

// The enums come from schema.prisma, so the database and the code can not drift apart.
export type { Gender, ImageView, ProductCategory, ProductStatus, ProductType };

/** "TOP" | "BOTTOM": the types that hang on the rail. */
export type HangingType = (typeof HANGING_TYPES)[number];

/** All valid sizes of one product type: SizeOf<"TOP"> = "XS" | "S" | ... */
export type SizeOf<T extends ProductType> = (typeof SIZE_CHART)[T][number];

/** Any valid size of any type. */
export type Size = SizeOf<ProductType>;

/** A photo side as the UI names it: "front" | "side" | "back". */
export type ViewKey = Lowercase<ImageView>;

export type Variant<T extends ProductType = ProductType> = {
  id: string;
  sku: string;
  size: SizeOf<T>;
  stock: number;
};

type ProductBase<T extends ProductType> = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  type: T;
  category: ProductCategory;
  gender: Gender;
  color: string;
  colorHex: string | null;
  /** In the store currency (see STORE.currency). */
  price: number;
  /** Price before the discount, only set when it is higher than `price`. */
  compareAtPrice: number | null;
  featured: boolean;
  /** Sorted in the order of the size chart. */
  variants: Variant<T>[];
};

/** Clothes on the rail need all three photos: the side is shown first, the front on hover. */
type HangingImages = { images: Record<ViewKey, string> };

/** Shoes need no photo to exist: a placeholder is shown until the photos are added. */
type FootwearImages = { images: Partial<Record<ViewKey, string>> };

export type TopProduct = ProductBase<"TOP"> & HangingImages;
export type BottomProduct = ProductBase<"BOTTOM"> & HangingImages;
export type FootwearProduct = ProductBase<"FOOTWEAR"> & FootwearImages;

export type HangingProduct = TopProduct | BottomProduct;

/** What the pages and components work with. `product.type` narrows the rest. */
export type Product = HangingProduct | FootwearProduct;

/** One purchasable size of any product. */
export type AnyVariant = Product["variants"][number];

/** For the home page: how many items of a type are in the store and one to show on the tile. */
export type TypeSummary = Record<ProductType, { count: number; cover: Product | null }>;
