import { prisma } from "@/lib/prisma";
import { StockMovementType } from "@/generated/prisma/enums";

export class StockError extends Error {}

type Change = {
  variantId: string;
  type: StockMovementType;
  note?: string | null;
  userId?: string | null;
} & ({ delta: number; setTo?: never } | { setTo: number; delta?: never });

/**
 * The only place that changes a stock balance. The balance and its history line are written in
 * one transaction, and the row is locked first, so two people (or an order and an admin) can
 * not overwrite each other. Orders will call this too (SALE / RETURN).
 *
 * `delta`  - add or take away
 * `setTo`  - the counted balance (inventory check); the difference is stored as the delta
 */
export async function changeStock(change: Change): Promise<{ stock: number; delta: number }> {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "product_variants" WHERE "id" = ${change.variantId} FOR UPDATE`;

    const variant = await tx.productVariant.findUnique({
      where: { id: change.variantId },
      select: { stock: true },
    });
    if (!variant) throw new StockError("Размер не найден.");

    const delta = change.setTo !== undefined ? change.setTo - variant.stock : change.delta;
    const next = variant.stock + delta;
    if (next < 0) throw new StockError(`Недостаточно товара: на складе ${variant.stock} шт.`);
    if (delta === 0) return { stock: variant.stock, delta: 0 };

    await tx.productVariant.update({ where: { id: change.variantId }, data: { stock: next } });
    await tx.stockMovement.create({
      data: {
        variantId: change.variantId,
        type: change.type,
        delta,
        balanceAfter: next,
        note: change.note?.trim() || null,
        userId: change.userId ?? null,
      },
    });
    return { stock: next, delta };
  });
}
