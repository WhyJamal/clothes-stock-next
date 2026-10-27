import { z } from "zod";
import { SIZE_CHART } from "@/config/catalog.config";
import { categoryBelongsTo, isSizeOf } from "@/lib/catalog";
import { Gender, ProductCategory, ProductStatus, ProductType } from "@/generated/prisma/enums";

const money = z
  .number("Укажите число.")
  .positive("Цена должна быть больше нуля.")
  .max(1_000_000_000, "Слишком большая цена.")
  .multipleOf(0.01, "Не больше двух знаков после запятой.");

/**
 * The shape of a product when it is created or edited (seed script now, admin panel later).
 * It checks what the database can not: the category must belong to the type, every size must
 * be in the size chart of that type, clothes on the rail need all three photos.
 *
 * Shoes never need photos (a placeholder is shown). `requireImages: false` also lets clothes wait
 * for theirs: the seed uses it and then keeps such clothes as DRAFT.
 */
export function createProductInputSchema({ requireImages = true }: { requireImages?: boolean } = {}) {
  return z
    .object({
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Адрес: латиница, цифры и дефис."),
      name: z.string().trim().min(2, "Название: минимум 2 символа.").max(120, "Название слишком длинное."),
      description: z.string().trim().max(2000).nullable().default(null),
      type: z.enum(ProductType),
      category: z.enum(ProductCategory),
      gender: z.enum(Gender).default(Gender.UNISEX),
      color: z.string().trim().min(2, "Укажите цвет.").max(40, "Слишком длинное название цвета."),
      colorHex: z
        .string()
        .regex(/^#[0-9a-f]{6}$/i, "Оттенок в формате #rrggbb.")
        .nullable()
        .default(null),
      price: money,
      compareAtPrice: money.nullable().default(null),
      status: z.enum(ProductStatus).default(ProductStatus.DRAFT),
      featured: z.boolean().default(false),
      sortOrder: z.number().int().default(0),
      images: z.object({
        front: z.string().min(1).optional(),
        side: z.string().min(1).optional(),
        back: z.string().min(1).optional(),
        folded: z.string().min(1).optional(),
      }),
      variants: z
        .array(
          z.object({
            size: z.string(),
            sku: z.string().trim().min(3).max(40),
            stock: z.number().int().min(0),
          }),
        )
        .min(1, "Выберите хотя бы один размер."),
    })
    .superRefine((p, ctx) => {
      if (!categoryBelongsTo(p.type, p.category)) {
        ctx.addIssue({
          code: "custom",
          path: ["category"],
          message: "Эта категория не подходит к выбранному типу.",
        });
      }

      const seen = new Set<string>();
      p.variants.forEach((v, i) => {
        if (!isSizeOf(p.type, v.size)) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", i, "size"],
            message: `Размер «${v.size}» не подходит. Допустимо: ${SIZE_CHART[p.type].join(", ")}.`,
          });
        }
        if (seen.has(v.size)) {
          ctx.addIssue({ code: "custom", path: ["variants", i, "size"], message: `Размер «${v.size}» повторяется.` });
        }
        seen.add(v.size);
      });

      if (p.compareAtPrice !== null && p.compareAtPrice <= p.price) {
        ctx.addIssue({
          code: "custom",
          path: ["compareAtPrice"],
          message: "Старая цена должна быть выше текущей.",
        });
      }

      if (requireImages && p.type !== ProductType.FOOTWEAR) {
        // tops hang on the rail (3 photos), bottoms lie on the table (flat front and back, the folded one is optional)
        const needed = p.type === ProductType.TOP ? (["front", "side", "back"] as const) : (["front", "back"] as const);
        for (const view of needed) {
          if (!p.images[view]) {
            ctx.addIssue({
              code: "custom",
              path: ["images", view],
              message: needed.length === 3 ? "Для активной вещи нужны все три фото." : "Для активной вещи нужны фото спереди и сзади.",
            });
          }
        }
      }
    });
}

export type ProductInput = z.input<ReturnType<typeof createProductInputSchema>>;
export type ParsedProductInput = z.output<ReturnType<typeof createProductInputSchema>>;
