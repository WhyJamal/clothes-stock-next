export type ProductView = "front" | "side" | "back";

export const SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export type Product = {
  id: string;
  name: string;
  category: string;
  /** Price in USD (placeholder values, change freely). */
  price: number;
  images: Record<ProductView, string>;
};

const imgs = (slug: string): Product["images"] => ({
  front: `/products/${slug}-front.webp`,
  side: `/products/${slug}-side.webp`,
  back: `/products/${slug}-back.webp`,
});

export const products: Product[] = [
  { id: "green-hoodie", name: "Худи Varsity", category: "Худи", price: 199, images: imgs("green-hoodie") },
  { id: "black-blazer", name: "Двубортный блейзер", category: "Блейзер", price: 349, images: imgs("black-blazer") },
  { id: "cream-sweatshirt", name: "Плотный свитшот", category: "Свитшот", price: 159, images: imgs("cream-sweatshirt") },
  { id: "grey-zip-hoodie", name: "Оверсайз худи на молнии", category: "Худи", price: 189, images: imgs("grey-zip-hoodie") },
  { id: "black-tee", name: "Футболка Reign", category: "Футболка", price: 89, images: imgs("black-tee") },
  { id: "olive-bomber", name: "Нейлоновый бомбер", category: "Куртка", price: 259, images: imgs("olive-bomber") },
  { id: "black-track", name: "Олимпийка Retro", category: "Куртка", price: 219, images: imgs("black-track") },
];

export const formatPrice = (price: number) => `$${price.toFixed(2)}`;
export const formatPriceShort = (price: number) => `$${Math.round(price)}`;
