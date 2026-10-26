import type {
  Gender,
  ProductCategory,
  ProductStatus,
  ProductType,
  StockMovementType,
} from "@/generated/prisma/enums";
import type { ViewKey } from "./product";

/** A line in the admin product list. */
export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  type: ProductType;
  category: ProductCategory;
  status: ProductStatus;
  price: number;
  compareAtPrice: number | null;
  featured: boolean;
  totalStock: number;
  sizes: number;
  photo: string | null;
  updatedAt: string; // ISO
};

/** One size of one product in the warehouse table. */
export type StockRow = {
  variantId: string;
  productId: string;
  productName: string;
  slug: string;
  type: ProductType;
  category: ProductCategory;
  productStatus: ProductStatus;
  size: string;
  sku: string;
  stock: number;
  price: number;
  photo: string | null;
};

export type StockLevel = "ok" | "low" | "out";

export type StockSummary = {
  /** Pieces on the shelves. */
  units: number;
  /** Sizes (SKUs) tracked. */
  skus: number;
  low: number;
  out: number;
  /** Sum of price x stock. */
  value: number;
};

export type MovementRow = {
  id: string;
  createdAt: string; // ISO
  type: StockMovementType;
  delta: number;
  balanceAfter: number;
  note: string | null;
  userName: string | null;
  productId: string;
  productName: string;
  size: string;
  sku: string;
};

/** What the product form edits. Numbers are strings while they are typed. */
export type ProductFormValues = {
  slug: string;
  name: string;
  description: string;
  type: ProductType;
  category: ProductCategory;
  gender: Gender;
  color: string;
  colorHex: string;
  price: string;
  compareAtPrice: string;
  status: ProductStatus;
  featured: boolean;
  sortOrder: string;
  images: Partial<Record<ViewKey, string>>;
};

/** An existing product opened for editing. */
export type ProductFormInitial = {
  id: string;
  values: ProductFormValues;
  /** Sizes that exist already and their current stock (the stock is changed in the warehouse). */
  sizes: Record<string, number>;
};

/** What the form sends to the server. */
export type ProductPayload = {
  /** Set when editing. */
  id?: string;
  slug: string;
  name: string;
  description: string;
  type: ProductType;
  category: ProductCategory;
  gender: Gender;
  color: string;
  colorHex: string | null;
  price: number;
  compareAtPrice: number | null;
  status: ProductStatus;
  featured: boolean;
  sortOrder: number;
  images: Partial<Record<ViewKey, string>>;
  /** Sizes to add with their first balance. Existing sizes are not sent. */
  newSizes: { size: string; stock: number }[];
};

export type SaveProductResult =
  | { ok: true; id: string }
  | { ok: false; message?: string; errors: Record<string, string> };

export type StockActionKind = "RECEIPT" | "ADJUSTMENT" | "WRITE_OFF";

export type StockActionInput = {
  variantId: string;
  kind: StockActionKind;
  /** RECEIPT / WRITE_OFF: how many pieces. ADJUSTMENT: the counted balance. */
  qty: number;
  note?: string;
};

export type StockActionResult = { ok: true; stock: number } | { ok: false; error: string };
