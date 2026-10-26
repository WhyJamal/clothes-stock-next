import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { PAGES } from "@/config/pages.config";
import { requireAdmin } from "@/lib/admin";
import { STORE } from "@/config/store.config";

/** Checks the admin first. Nothing below it is rendered for anybody else. */
export async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-dvh bg-[#fbfafc]">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link href={PAGES.ADMIN} className="flex items-baseline gap-2">
            <span className="text-lg font-black tracking-[-0.05em] text-neutral-900">{STORE.name}</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Admin</span>
          </Link>
          <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1">
            <AdminNav />
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs text-neutral-500">
            <span className="hidden max-w-40 truncate sm:inline" title={admin.email}>
              {admin.name}
            </span>
            <Link href={PAGES.HOME} className="flex items-center gap-1 text-neutral-900 underline-offset-4 hover:underline">
              На сайт
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export function PageHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-900">{title}</h1>
      {children}
    </div>
  );
}
