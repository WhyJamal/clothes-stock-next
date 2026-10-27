"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin";
import { PRODUCTS_TAG } from "@/lib/product-queries";
import { createProductInputSchema } from "@/lib/product-schema";
import { prisma } from "@/lib/prisma";
import { changeStock, StockError } from "@/lib/stock";
import { deleteProductImages } from "@/lib/storage";
import { StockMovementType, type ImageView } from "@/generated/prisma/enums";
import type { ProductPayload, SaveProductResult, StockActionInput, StockActionResult, ViewKey } from "@/types";

// Every action checks the admin again: the layout check protects pages, not these calls.

const sku = (slug: string, size: string) => `${slug}-${size}`.toUpperCase();

const imageRows = (images: Partial<Record<ViewKey, string>>, alt: string) =>
  (Object.entries(images) as [ViewKey, string | undefined][])
    .filter((e): e is [ViewKey, string] => Boolean(e[1]))
    .map(([view, url]) => ({ view: view.toUpperCase() as ImageView, url, alt }));

const firstStock = (stock: number, userId: string) =>
  stock > 0
    ? {
        create: {
          type: StockMovementType.INITIAL,
          delta: stock,
          balanceAfter: stock,
          note: "Начальный остаток",
          userId,
        },
      }
    : undefined;

export async function saveProductAction(payload: ProductPayload): Promise<SaveProductResult> {
  const admin = await assertAdmin().catch(() => null);
  if (!admin) return { ok: false, errors: {}, message: "Нет доступа. Войдите как администратор." };

  const existing = payload.id
    ? await prisma.product.findUnique({
        where: { id: payload.id },
        include: {
          variants: { select: { size: true, sku: true, stock: true } },
          images: { select: { url: true } },
        },
      })
    : null;
  if (payload.id && !existing) return { ok: false, errors: {}, message: "Не удалось сохранить. Попробуйте ещё раз." };

  // slug and type are fixed after the product is created
  const slug = existing?.slug ?? payload.slug.trim().toLowerCase();
  const type = existing?.type ?? payload.type;

  const known = new Set(existing?.variants.map((v) => v.size));
  const newSizes = payload.newSizes.filter((v) => !known.has(v.size));

  const parsed = createProductInputSchema({ requireImages: payload.status === "ACTIVE" }).safeParse({
    slug,
    name: payload.name,
    description: payload.description.trim() || null,
    type,
    category: payload.category,
    gender: payload.gender,
    color: payload.color,
    colorHex: payload.colorHex,
    price: payload.price,
    compareAtPrice: payload.compareAtPrice,
    status: payload.status,
    featured: payload.featured,
    sortOrder: payload.sortOrder,
    images: payload.images,
    variants: [
      ...(existing?.variants ?? []),
      ...newSizes.map((v) => ({ size: v.size, sku: sku(slug, v.size), stock: v.stock })),
    ],
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const [head, sub] = issue.path;
      const key = head === "variants" ? "sizes" : head === "images" ? `images.${String(sub)}` : String(head);
      errors[key] ??= issue.message;
    }
    return { ok: false, errors, message: "Проверьте отмеченные поля." };
  }

  const d = parsed.data;
  try {
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          slug: d.slug,
          name: d.name,
          description: d.description,
          type: d.type,
          category: d.category,
          gender: d.gender,
          color: d.color,
          colorHex: d.colorHex,
          price: d.price,
          compareAtPrice: d.compareAtPrice,
          status: d.status,
          featured: d.featured,
          sortOrder: d.sortOrder,
          images: { create: imageRows(d.images, d.name) },
          variants: {
            create: d.variants.map((v) => ({
              size: v.size,
              sku: v.sku,
              stock: v.stock,
              movements: firstStock(v.stock, admin.id),
            })),
          },
        },
      });
      updateTag(PRODUCTS_TAG);
      return { ok: true, id: created.id };
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: existing.id },
        data: {
          name: d.name,
          description: d.description,
          category: d.category,
          gender: d.gender,
          color: d.color,
          colorHex: d.colorHex,
          price: d.price,
          compareAtPrice: d.compareAtPrice,
          status: d.status,
          featured: d.featured,
          sortOrder: d.sortOrder,
        },
      });
      await tx.productImage.deleteMany({ where: { productId: existing.id } });
      await tx.productImage.createMany({
        data: imageRows(d.images, d.name).map((r) => ({ ...r, productId: existing.id })),
      });
      // new sizes only: the stock of the existing ones belongs to the warehouse
      for (const v of newSizes) {
        await tx.productVariant.create({
          data: {
            productId: existing.id,
            size: v.size,
            sku: sku(existing.slug, v.size),
            stock: v.stock,
            movements: firstStock(v.stock, admin.id),
          },
        });
      }
    });
    // photos that were replaced or removed in the form are no longer used: delete them from Blob
    const kept = new Set(Object.values(d.images));
    await deleteProductImages(existing.images.map((i) => i.url).filter((u) => !kept.has(u)));
    updateTag(PRODUCTS_TAG);
    return { ok: true, id: existing.id };
  } catch (err) {
    if (typeof err === "object" && err && "code" in err && err.code === "P2002") {
      return { ok: false, errors: { slug: "Такой адрес уже занят." }, message: "Проверьте отмеченные поля." };
    }
    console.error("saveProduct failed", err);
    return { ok: false, errors: {}, message: "Не удалось сохранить. Попробуйте ещё раз." };
  }
}

const stockSchema = z.object({
  variantId: z.string().min(1),
  kind: z.enum(["RECEIPT", "ADJUSTMENT", "WRITE_OFF"]),
  qty: z.number().int().min(0).max(100_000),
  note: z.string().trim().max(200).optional(),
});

export async function stockAction(input: StockActionInput): Promise<StockActionResult> {
  const admin = await assertAdmin().catch(() => null);
  if (!admin) return { ok: false, error: "Нет доступа. Войдите как администратор." };

  const parsed = stockSchema.safeParse(input);
  if (!parsed.success || (parsed.data.kind !== "ADJUSTMENT" && parsed.data.qty < 1)) {
    return { ok: false, error: "Введите целое число от 0." };
  }
  const { variantId, kind, qty, note } = parsed.data;

  try {
    const result = await changeStock({
      variantId,
      note,
      userId: admin.id,
      ...(kind === "RECEIPT"
        ? { type: StockMovementType.RECEIPT, delta: qty }
        : kind === "WRITE_OFF"
          ? { type: StockMovementType.WRITE_OFF, delta: -qty }
          : { type: StockMovementType.ADJUSTMENT, setTo: qty }),
    });
    updateTag(PRODUCTS_TAG);
    return { ok: true, stock: result.stock };
  } catch (err) {
    if (err instanceof StockError) return { ok: false, error: err.message };
    console.error("stockAction failed", err);
    return { ok: false, error: "Не удалось изменить остаток." };
  }
}

/** Deletes the product (sizes, stock history and photo rows go with it) and its photos from Blob. */
export async function deleteProductAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await assertAdmin().catch(() => null);
  if (!admin) return { ok: false, error: "Нет доступа. Войдите как администратор." };

  const product = await prisma.product.findUnique({ where: { id }, select: { images: { select: { url: true } } } });
  if (!product) return { ok: false, error: "Товар не найден." };

  try {
    await prisma.product.delete({ where: { id } });
  } catch (err) {
    console.error("deleteProduct failed", err);
    return { ok: false, error: "Не удалось удалить товар. Попробуйте ещё раз." };
  }

  // the row is gone, so a failed Blob delete can not break the store: it is only logged
  await deleteProductImages(product.images.map((i) => i.url));
  updateTag(PRODUCTS_TAG);
  return { ok: true };
}
