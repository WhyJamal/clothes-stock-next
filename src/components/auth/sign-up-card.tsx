"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { registerAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/auth/field";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordInput } from "@/components/auth/password-input";
import { PAGES } from "@/config/pages.config";
import { t } from "@/lib/content";

type Errors = Partial<Record<"name" | "email" | "password" | "confirm" | "form", string>>;

export function SignUpCard() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();
  const c = t.auth.signUp;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setErrors({});

    startTransition(async () => {
      const result = await registerAction(form);
      if (!result.ok) {
        setErrors({ ...result.fields, form: result.error });
        return;
      }

      // account created: sign in right away
      const res = await signIn("credentials", {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        redirect: false,
      });
      if (!res || res.error) {
        router.push(PAGES.SIGNIN);
        return;
      }
      router.push(PAGES.HOME);
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-sm bg-white py-8 shadow-[0_8px_40px_rgba(0,0,0,0.05)] ring-neutral-200/70">
      <CardHeader className="text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">{c.eyebrow}</p>
        <CardTitle className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-neutral-900">
          {c.title}
        </CardTitle>
        <CardDescription className="text-neutral-500">{c.subtitle}</CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate>
        <CardContent className="grid gap-4">
          <GoogleButton disabled={pending} />
          <Field id="name" label={c.name} error={errors.name}>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder={c.namePlaceholder}
              required
              disabled={pending}
              aria-invalid={!!errors.name}
              className="h-10 bg-[#e9e8ec]"
            />
          </Field>
          <Field id="email" label={t.auth.email} error={errors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t.auth.emailPlaceholder}
              required
              disabled={pending}
              aria-invalid={!!errors.email}
              className="h-10 bg-[#e9e8ec]"
            />
          </Field>
          <Field id="password" label={t.auth.password} error={errors.password} hint={c.hint}>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
              disabled={pending}
              aria-invalid={!!errors.password}
            />
          </Field>
          <Field id="confirm" label={c.confirm} error={errors.confirm}>
            <PasswordInput
              id="confirm"
              name="confirm"
              autoComplete="new-password"
              required
              disabled={pending}
              aria-invalid={!!errors.confirm}
            />
          </Field>

          {errors.form && (
            <p role="alert" className="text-center text-xs text-destructive">
              {errors.form}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-2 h-10 w-full rounded-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> {c.submitting}
              </>
            ) : (
              c.submit
            )}
          </Button>
        </CardContent>
      </form>

      <CardFooter className="justify-center gap-1.5 text-xs text-neutral-500">
        {c.haveAccount}
        <Link href={PAGES.SIGNIN} className="font-medium text-neutral-900 underline-offset-4 hover:underline">
          {c.toSignIn}
        </Link>
      </CardFooter>
    </Card>
  );
}
