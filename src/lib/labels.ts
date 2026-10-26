// Labels of enum values, used on many screens (the other texts live in their components).
import type { Gender, ProductCategory, ProductStatus, ProductType } from "@/generated/prisma/enums";

export const TYPE_LABEL = { TOP: "Верх", BOTTOM: "Низ", FOOTWEAR: "Обувь" } satisfies Record<ProductType, string>;

export const TYPE_HINT = { TOP: "Худи, футболки, куртки", BOTTOM: "Джинсы, брюки, карго", FOOTWEAR: "Кроссовки, ботинки, лоферы" } satisfies Record<ProductType, string>;

export const CATEGORY_LABEL = {
  T_SHIRT: "Футболка",
  SHIRT: "Рубашка",
  SWEATSHIRT: "Свитшот",
  HOODIE: "Худи",
  KNITWEAR: "Трикотаж",
  BLAZER: "Блейзер",
  JACKET: "Куртка",
  COAT: "Пальто",
  JEANS: "Джинсы",
  TROUSERS: "Брюки",
  CARGO: "Карго",
  JOGGERS: "Джоггеры",
  SHORTS: "Шорты",
  SNEAKERS: "Кроссовки",
  BOOTS: "Ботинки",
  LOAFERS: "Лоферы",
  SANDALS: "Сандалии",
} satisfies Record<ProductCategory, string>;

export const GENDER_LABEL = { MEN: "Мужское", WOMEN: "Женское", UNISEX: "Унисекс" } satisfies Record<Gender, string>;

export const STATUS_LABEL = { DRAFT: "Черновик", ACTIVE: "Активен", ARCHIVED: "В архиве" } satisfies Record<ProductStatus, string>;
