import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = { title: "Shimitsu · Админка", robots: { index: false, follow: false } };

// The session is read at request time, so the shell streams in behind a Suspense boundary.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={<div className="grid min-h-dvh place-items-center text-sm text-neutral-400">Загрузка…</div>}
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
