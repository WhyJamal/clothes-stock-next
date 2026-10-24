"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { PAGES } from "@/config/pages.config";
import { t } from "@/lib/content";

/** "Присоединиться | Войти" (or "Выйти") in the thin strip above the header. */
export function UtilityAuth() {
  const { status } = useSession();

  if (status === "authenticated") {
    return (
      <>
        <span className="text-neutral-300">|</span>
        <button onClick={() => signOut({ callbackUrl: PAGES.HOME })} className="cursor-pointer">
          {t.header.logout}
        </button>
      </>
    );
  }

  return (
    <>
      <span className="text-neutral-300">|</span>
      <Link href={PAGES.SIGNUP}>{t.header.join}</Link>
      <span className="text-neutral-300">|</span>
      <Link href={PAGES.SIGNIN}>{t.header.login}</Link>
    </>
  );
}

/** The user icon next to the cart: a link to sign-in, or the user's initial when signed in. */
export function UserButton() {
  const { data, status } = useSession();

  if (status === "authenticated") {
    const name = data.user?.name ?? data.user?.email ?? "";
    return (
      <div className="flex items-center gap-2">
        <span
          title={name}
          aria-label={`${t.header.account}: ${name}`}
          className="grid size-6 place-items-center rounded-full bg-neutral-950 text-[10px] font-semibold uppercase text-white"
        >
          {name.charAt(0)}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: PAGES.HOME })}
          aria-label={t.header.logout}
          className="cursor-pointer text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-full"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <Link href={PAGES.SIGNIN} aria-label={t.header.login} className="text-neutral-900">
      <User className="size-4" />
    </Link>
  );
}
