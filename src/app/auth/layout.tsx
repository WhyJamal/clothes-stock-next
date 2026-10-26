import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PAGES } from "@/config/pages.config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#fbfafc]">
      <header className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
        <Link
          href={PAGES.HOME}
          className="flex items-center gap-1.5 text-[11px] text-neutral-600 transition-colors hover:text-neutral-950"
        >
          <ArrowLeft className="size-3.5" />
          На главную
        </Link>
        <Link href={PAGES.HOME} className="text-lg font-black tracking-tighter text-neutral-900">
          Shimitsu
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pt-4 pb-16">{children}</main>
    </div>
  );
}
