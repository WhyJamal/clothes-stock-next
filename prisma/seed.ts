import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Gender, ProductCategory, ProductStatus, ProductType } from "../src/generated/prisma/enums";
import { createProductInputSchema, type ProductInput } from "../src/lib/product-schema";

// npm run db:seed. Safe to run again: products are matched by slug and rewritten.

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Stock = Record<string, number>;

const photos = (dir: string, slug: string) => ({
  front: `/products/${dir}${slug}-front.webp`,
  side: `/products/${dir}${slug}-side.webp`,
  back: `/products/${dir}${slug}-back.webp`,
});

const variants = (slug: string, stock: Stock) =>
  Object.entries(stock).map(([size, n]) => ({ size, sku: `${slug}-${size}`.toUpperCase(), stock: n }));

const TOP_STOCK: Stock = { XS: 3, S: 8, M: 12, L: 9, XL: 5, XXL: 2 };
const SHOE_STOCK: Stock = { "40": 4, "41": 7, "42": 9, "43": 6, "44": 3 };

const clothes: ProductInput[] = [
  {
    slug: "green-hoodie", name: "Худи Varsity", type: ProductType.TOP, category: ProductCategory.HOODIE,
    gender: Gender.UNISEX, color: "Зелёный", colorHex: "#1f3d2b", price: 199,
    description: "Плотный футер, свободный крой и принт в стиле университетских команд.",
    status: ProductStatus.ACTIVE, featured: true, sortOrder: 10,
    images: photos("", "green-hoodie"), variants: variants("green-hoodie", TOP_STOCK),
  },
  {
    slug: "black-blazer", name: "Двубортный блейзер", type: ProductType.TOP, category: ProductCategory.BLAZER,
    gender: Gender.UNISEX, color: "Чёрный", colorHex: "#111111", price: 349,
    description: "Строгий двубортный блейзер с чёткой линией плеч.",
    status: ProductStatus.ACTIVE, featured: true, sortOrder: 20,
    images: photos("", "black-blazer"), variants: variants("black-blazer", { S: 4, M: 6, L: 5, XL: 2 }),
  },
  {
    slug: "cream-sweatshirt", name: "Плотный свитшот", type: ProductType.TOP, category: ProductCategory.SWEATSHIRT,
    gender: Gender.UNISEX, color: "Кремовый", colorHex: "#efe6d6", price: 159,
    description: "Тяжёлый хлопковый футер, который держит форму.",
    status: ProductStatus.ACTIVE, featured: true, sortOrder: 30,
    images: photos("", "cream-sweatshirt"), variants: variants("cream-sweatshirt", TOP_STOCK),
  },
  {
    slug: "grey-zip-hoodie", name: "Оверсайз худи на молнии", type: ProductType.TOP, category: ProductCategory.HOODIE,
    gender: Gender.UNISEX, color: "Серый меланж", colorHex: "#b9b9bd", price: 189, compareAtPrice: 229,
    description: "Оверсайз-посадка и надёжная молния на всю длину.",
    status: ProductStatus.ACTIVE, featured: true, sortOrder: 40,
    images: photos("", "grey-zip-hoodie"), variants: variants("grey-zip-hoodie", TOP_STOCK),
  },
  {
    slug: "black-tee", name: "Футболка Reign", type: ProductType.TOP, category: ProductCategory.T_SHIRT,
    gender: Gender.UNISEX, color: "Чёрный", colorHex: "#151515", price: 89,
    description: "Базовая футболка из плотного хлопка.",
    status: ProductStatus.ACTIVE, sortOrder: 50,
    images: photos("", "black-tee"), variants: variants("black-tee", { XS: 5, S: 10, M: 14, L: 11, XL: 6, XXL: 0 }),
  },
  {
    slug: "olive-bomber", name: "Нейлоновый бомбер", type: ProductType.TOP, category: ProductCategory.JACKET,
    gender: Gender.UNISEX, color: "Оливковый", colorHex: "#5b5f45", price: 259,
    description: "Лёгкий нейлоновый бомбер на каждый день.",
    status: ProductStatus.ACTIVE, sortOrder: 60,
    images: photos("", "olive-bomber"), variants: variants("olive-bomber", { S: 3, M: 5, L: 4, XL: 2 }),
  },
  {
    slug: "black-track", name: "Олимпийка Retro", type: ProductType.TOP, category: ProductCategory.JACKET,
    gender: Gender.UNISEX, color: "Чёрный", colorHex: "#1c1c1c", price: 219,
    description: "Ретро-олимпийка с контрастными лампасами на рукавах.",
    status: ProductStatus.ACTIVE, sortOrder: 70,
    images: photos("", "black-track"), variants: variants("black-track", { S: 3, M: 6, L: 5, XL: 2 }),
  },
];

// Shoe photos are transparent .webp files in /public/products/footwear (front, side, back).
const shoe = (
  slug: string, name: string, category: ProductCategory, color: string, colorHex: string,
  price: number, sortOrder: number, extra: Partial<ProductInput> = {},
): ProductInput => ({
  slug, name, type: ProductType.FOOTWEAR, category, gender: Gender.UNISEX, color, colorHex, price,
  status: ProductStatus.ACTIVE, sortOrder,
  images: photos("footwear/", slug), variants: variants(slug, SHOE_STOCK),
  ...extra,
});

const footwear: ProductInput[] = [
  shoe("chelsea-black", "Ботинки челси", ProductCategory.BOOTS, "Чёрный", "#141414", 289, 110, { featured: true }),
  shoe("combat-mid", "Ботинки Combat Mid", ProductCategory.BOOTS, "Чёрный", "#161616", 299, 120),
  shoe("court-low", "Кеды Court Low", ProductCategory.SNEAKERS, "Белый", "#f4f3ef", 179, 130, { featured: true }),
  shoe("daybreak", "Кроссовки Daybreak", ProductCategory.SNEAKERS, "Бежевый", "#d9c3a5", 169, 140, { compareAtPrice: 209 }),
  shoe("field-boot", "Ботинки Field", ProductCategory.BOOTS, "Коричневый", "#4a2f27", 269, 150),
  shoe("nike-next", "Кроссовки Next", ProductCategory.SNEAKERS, "Белый", "#fafafa", 189, 160, { featured: true }),
  shoe("runner-01", "Кроссовки Runner-01", ProductCategory.SNEAKERS, "Серый", "#8b8b8f", 159, 170),
  shoe("slide-black", "Слайды Black", ProductCategory.SANDALS, "Чёрный", "#101010", 59, 180, {
    variants: variants("slide-black", { "40": 6, "41": 8, "42": 0, "43": 5, "44": 4 }),
  }),
];

async function main() {
  // Clothes may wait for their photos (kept as DRAFT); the other rules always apply.
  const schema = createProductInputSchema({ requireImages: false });
  const all = [...clothes, ...footwear].map((input) => schema.parse(input));

  for (const p of all) {
    const { images, variants: sizes, ...fields } = p;
    const hasAllPhotos = Boolean(images.front && images.side && images.back);
    const status =
      p.type !== ProductType.FOOTWEAR && !hasAllPhotos ? ProductStatus.DRAFT : p.status;

    const imageRows = (Object.entries(images) as ["front" | "side" | "back", string | undefined][])
      .filter((e): e is ["front" | "side" | "back", string] => Boolean(e[1]))
      .map(([view, url]) => ({ view: view.toUpperCase() as "FRONT" | "SIDE" | "BACK", url, alt: p.name }));

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.upsert({
        where: { slug: p.slug },
        create: { ...fields, status },
        update: { ...fields, status },
      });
      // rewrite photos and sizes so a second run gives the same result
      await tx.productImage.deleteMany({ where: { productId: product.id } });
      await tx.productVariant.deleteMany({ where: { productId: product.id } });
      await tx.productImage.createMany({ data: imageRows.map((r) => ({ ...r, productId: product.id })) });
      await tx.productVariant.createMany({ data: sizes.map((v) => ({ ...v, productId: product.id })) });
    });
    console.log(`${status === ProductStatus.ACTIVE ? "✓" : "·"} ${p.slug} (${status})`);
  }
  console.log(`Seeded ${all.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
