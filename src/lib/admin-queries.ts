import { sizeIndex, stockLevel } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import type {
  AdminProductRow,
  MovementRow,
  ProductFormInitial,
  StockRow,
  StockSummary,
  ViewKey,
} from "@/types";

// Admin data is never cached: these run on every request, behind the admin check.
export const instant = false;

const firstPhoto = (images: { view: string; url: string }[]) =>
  (images.find((i) => i.view === "FRONT") ?? images.find((i) => i.view === "SIDE") ?? images[0])?.url ?? null;

export async function getAdminProducts(): Promise<AdminProductRow[]> {
  const rows = await prisma.product.findMany({
    include: { images: true, variants: { select: { stock: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type,
    category: p.category,
    status: p.status,
    price: p.price.toNumber(),
    compareAtPrice: p.compareAtPrice?.toNumber() ?? null,
    featured: p.featured,
    totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    sizes: p.variants.length,
    photo: firstPhoto(p.images),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function getAdminProduct(id: string): Promise<ProductFormInitial | null> {
  const p = await prisma.product.findUnique({ where: { id }, include: { images: true, variants: true } });
  if (!p) return null;

  const images: Partial<Record<ViewKey, string>> = {};
  for (const img of p.images) images[img.view.toLowerCase() as ViewKey] = img.url;

  return {
    id: p.id,
    values: {
      slug: p.slug,
      name: p.name,
      description: p.description ?? "",
      type: p.type,
      category: p.category,
      gender: p.gender,
      color: p.color,
      colorHex: p.colorHex ?? "#111111",
      price: String(p.price.toNumber()),
      compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice.toNumber()) : "",
      status: p.status,
      featured: p.featured,
      sortOrder: String(p.sortOrder),
      images,
    },
    sizes: Object.fromEntries(p.variants.map((v) => [v.size, v.stock])),
  };
}

export async function getStockRows(): Promise<StockRow[]> {
  const rows = await prisma.productVariant.findMany({
    include: { product: { include: { images: true } } },
  });

  return rows
    .map((v) => ({
      variantId: v.id,
      productId: v.productId,
      productName: v.product.name,
      slug: v.product.slug,
      type: v.product.type,
      category: v.product.category,
      productStatus: v.product.status,
      size: v.size,
      sku: v.sku,
      stock: v.stock,
      price: v.product.price.toNumber(),
      photo: firstPhoto(v.product.images),
      order: v.product.sortOrder,
    }))
    .sort(
      (a, b) =>
        a.order - b.order ||
        a.productName.localeCompare(b.productName, "ru") ||
        sizeIndex(a.type, a.size) - sizeIndex(b.type, b.size),
    )
    .map(({ order: _order, ...row }) => {
      void _order;
      return row;
    });
}

export function summarizeStock(rows: StockRow[]): StockSummary {
  return rows.reduce<StockSummary>(
    (s, r) => ({
      units: s.units + r.stock,
      skus: s.skus + 1,
      low: s.low + (stockLevel(r.stock) === "low" ? 1 : 0),
      out: s.out + (stockLevel(r.stock) === "out" ? 1 : 0),
      value: s.value + r.stock * r.price,
    }),
    { units: 0, skus: 0, low: 0, out: 0, value: 0 },
  );
}

export async function getMovements({ variantId, limit = 200 }: { variantId?: string; limit?: number } = {}): Promise<
  MovementRow[]
> {
  const rows = await prisma.stockMovement.findMany({
    where: variantId ? { variantId } : undefined,
    include: { user: { select: { name: true } }, variant: { include: { product: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((m) => ({
    id: m.id,
    createdAt: m.createdAt.toISOString(),
    type: m.type,
    delta: m.delta,
    balanceAfter: m.balanceAfter,
    note: m.note,
    userName: m.user?.name ?? null,
    productId: m.variant.product.id,
    productName: m.variant.product.name,
    size: m.variant.size,
    sku: m.variant.sku,
  }));
}
