import type { AnyVariant, Product } from "./product";

export type CartLine = {
  /** The variant id: one line per size. */
  key: string;
  product: Product;
  variant: AnyVariant;
  qty: number;
};
