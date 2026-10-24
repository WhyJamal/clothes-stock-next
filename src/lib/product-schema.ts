import { z } from "zod";
import { SIZE_CHART } from "@/config/catalog.config";
import { categoryBelongsTo, isSizeOf } from "@/lib/catalog";
import { Gender, ProductCategory, ProductStatus, ProductType } from "@/generated/prisma/enums";

const money = z.number().positive().max(1_000_000_000).multipleOf(0.01);

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
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug: only a-z, 0-9 and dashes"),
      name: z.string().trim().min(2).max(120),
      description: z.string().trim().max(2000).nullable().default(null),
      type: z.enum(ProductType),
      category: z.enum(ProductCategory),
      gender: z.enum(Gender).default(Gender.UNISEX),
      color: z.string().trim().min(2).max(40),
      colorHex: z
        .string()
        .regex(/^#[0-9a-f]{6}$/i, "colorHex: #rrggbb")
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
      }),
      variants: z
        .array(
          z.object({
            size: z.string(),
            sku: z.string().trim().min(3).max(40),
            stock: z.number().int().min(0),
          }),
        )
        .min(1),
    })
    .superRefine((p, ctx) => {
      if (!categoryBelongsTo(p.type, p.category)) {
        ctx.addIssue({
          code: "custom",
          path: ["category"],
          message: `${p.category} is not a ${p.type} category`,
        });
      }

      const seen = new Set<string>();
      p.variants.forEach((v, i) => {
        if (!isSizeOf(p.type, v.size)) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", i, "size"],
            message: `size "${v.size}" is not valid for ${p.type} (use: ${SIZE_CHART[p.type].join(", ")})`,
          });
        }
        if (seen.has(v.size)) {
          ctx.addIssue({ code: "custom", path: ["variants", i, "size"], message: `size "${v.size}" is repeated` });
        }
        seen.add(v.size);
      });

      if (p.compareAtPrice !== null && p.compareAtPrice <= p.price) {
        ctx.addIssue({
          code: "custom",
          path: ["compareAtPrice"],
          message: "compareAtPrice must be higher than price",
        });
      }

      if (requireImages && p.type !== ProductType.FOOTWEAR) {
        for (const view of ["front", "side", "back"] as const) {
          if (!p.images[view]) {
            ctx.addIssue({ code: "custom", path: ["images", view], message: `clothes need a ${view} photo` });
          }
        }
      }
    });
}

export type ProductInput = z.input<ReturnType<typeof createProductInputSchema>>;
export type ParsedProductInput = z.output<ReturnType<typeof createProductInputSchema>>;
