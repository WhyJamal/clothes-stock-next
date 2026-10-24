"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validation";
import { t } from "@/lib/content";

type Field = "name" | "email" | "password" | "confirm";

export type RegisterResult =
  | { ok: true }
  | { ok: false; error?: string; fields?: Partial<Record<Field, string>> };

export async function registerAction(formData: FormData): Promise<RegisterResult> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    const fields: Partial<Record<Field, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as Field;
      if (key && !fields[key]) fields[key] = issue.message;
    }
    return { ok: false, fields };
  }

  const { name, email, password } = parsed.data;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return { ok: false, fields: { email: t.auth.errors.exists } };

    await prisma.user.create({
      data: { name, email, passwordHash: await hash(password, 12) },
    });
    return { ok: true };
  } catch (err) {
    // unique constraint hit by a parallel request
    if (typeof err === "object" && err && "code" in err && err.code === "P2002") {
      return { ok: false, fields: { email: t.auth.errors.exists } };
    }
    console.error("register failed", err);
    return { ok: false, error: t.auth.errors.generic };
  }
}
