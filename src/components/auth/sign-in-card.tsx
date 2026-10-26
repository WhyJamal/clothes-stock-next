"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/auth/field";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordInput } from "@/components/auth/password-input";
import { PAGES } from "@/config/pages.config";

export function SignInCard() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      const res = await signIn("credentials", {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        redirect: false,
      });

      if (!res || res.error) {
        setError("Неверный email или пароль.");
        return;
      }
      router.push(PAGES.HOME);
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-sm bg-white py-8 shadow-[0_8px_40px_rgba(0,0,0,0.05)] ring-neutral-200/70">
      <CardHeader className="text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Аккаунт</p>
        <CardTitle className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-neutral-900">
          С возвращением
        </CardTitle>
        <CardDescription className="text-neutral-500">Войдите, чтобы продолжить покупки.</CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate>
        <CardContent className="grid gap-4">
          <GoogleButton disabled={pending} />
          <Field id="email" label="Email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              disabled={pending}
              aria-invalid={!!error}
              className="h-10 bg-[#e9e8ec]"
            />
          </Field>
          <Field id="password" label="Пароль" error={error ?? undefined}>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
              disabled={pending}
              aria-invalid={!!error}
            />
          </Field>
          <Button type="submit" size="lg" className="mt-2 h-10 w-full rounded-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Входим…
              </>
            ) : (
              "Войти"
            )}
          </Button>
        </CardContent>
      </form>

      <CardFooter className="justify-center gap-1.5 text-xs text-neutral-500">
        Нет аккаунта?
        <Link href={PAGES.SIGNUP} className="font-medium text-neutral-900 underline-offset-4 hover:underline">
          Зарегистрироваться
        </Link>
      </CardFooter>
    </Card>
  );
}
