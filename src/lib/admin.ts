import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { PAGES } from "@/config/pages.config";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AdminUser = { id: string; name: string; email: string };

/**
 * The signed-in admin, or null. The role is always read from the database, never from the
 * session token, so taking the role away works at once.
 */
export async function getAdmin(): Promise<AdminUser | null> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return null;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  return user?.role === "ADMIN" ? { id: user.id, name: user.name, email: user.email } : null;
}

/** For pages: not signed in -> sign-in page, signed in but not an admin -> 404 (the admin area stays hidden). */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (admin) return admin;

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(PAGES.SIGNIN);
  notFound();
}

/** For server actions and route handlers: throws instead of redirecting. */
export async function assertAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return admin;
}
