import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PAGES } from "@/config/pages.config";
import { t } from "@/lib/content";
import { cn } from "@/lib/utils";

export function JoinCta() {
  const { cta } = t.home;

  return (
    <section className="mx-auto mt-24 max-w-350 px-6">
      <div className="rounded-[2rem] bg-neutral-950 px-6 py-14 text-center text-white sm:py-20">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/50">{cta.eyebrow}</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-[clamp(26px,4vw,52px)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance">
          {cta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/60">{cta.text}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={PAGES.SIGNUP}
            className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-white px-6 text-neutral-950 hover:bg-neutral-200")}
          >
            {cta.primary}
          </Link>
          <Link
            href={PAGES.SIGNIN}
            className={cn(
              buttonVariants({ size: "lg", variant: "ghost" }),
              "rounded-full px-6 text-white hover:bg-white/10 hover:text-white",
            )}
          >
            {cta.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
