import { z } from "zod";
import { t } from "@/lib/content";

const e = t.auth.errors;

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email(e.email)),
  password: z.string().min(1, e.passwordRequired),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, e.name).max(60, e.name),
    email: z.string().trim().toLowerCase().pipe(z.email(e.email)),
    password: z.string().min(8, e.password).max(72, e.password),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: e.mismatch,
  });
