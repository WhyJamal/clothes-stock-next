import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Введите корректный email.")),
  password: z.string().min(1, "Введите пароль."),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Введите имя (минимум 2 символа).").max(60, "Введите имя (минимум 2 символа)."),
    email: z.string().trim().toLowerCase().pipe(z.email("Введите корректный email.")),
    password: z.string().min(8, "Пароль должен быть от 8 до 72 символов.").max(72, "Пароль должен быть от 8 до 72 символов."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Пароли не совпадают.",
  });
