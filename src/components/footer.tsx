import Link from "next/link";
import { Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PAGES } from "@/config/pages.config";
import { FOOTER } from "@/components/footer.config";
import { STORE } from "@/config/store.config";

export function Footer() {
  return (
    <footer id="contacts" className="mt-16 shrink-0 bg-[#f1f0f3] px-6 pt-12 pb-6 text-neutral-600">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href={PAGES.HOME} className="text-lg font-black tracking-tighter text-neutral-900">
            {STORE.name}
          </Link>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-neutral-500">Премиальный стритвир. Плотный футер, свободный крой, сделано надолго.</p>
          <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-800">
            Контакты
          </p>
          <a
            href="mailto:hello@shimitsu.example"
            className="mt-2 inline-flex items-center gap-2 text-xs text-neutral-700 underline-offset-4 hover:underline"
          >
            <Mail className="size-3.5" />
            hello@shimitsu.example
          </a>
        </div>

        {FOOTER.columns.map((col) => (
          <div key={col.title}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-800">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2.5 text-xs">
              {col.links.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-neutral-600 underline-offset-4 transition-colors hover:text-neutral-950 hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Separator className="mx-auto mt-10 max-w-6xl bg-neutral-300/60" />

      <div className="mx-auto mt-5 flex max-w-6xl flex-col items-center justify-between gap-3 text-[10px] text-neutral-500 sm:flex-row">
        <p>
          © {STORE.name}. Все права защищены.
        </p>
        <div className="flex gap-4">
          {FOOTER.legal.map(({ label, href }) => (
            <Link key={label} href={href} className="hover:text-neutral-900">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
