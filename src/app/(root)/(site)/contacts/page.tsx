import type { Metadata } from "next";
import { ArrowUpRight, Camera, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CONTACTS } from "@/config/contacts.config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shimitsu · Контакты",
  description: "Напишите нам в Telegram, позвоните или приходите в магазин. Адрес, часы работы и все способы связи.",
};

const CHANNELS = [
  {
    icon: Send,
    title: "Telegram",
    value: CONTACTS.telegram.label,
    href: CONTACTS.telegram.href,
    hint: "Быстрее всего: отвечаем в течение часа",
    tint: "bg-[#ecebf0]",
  },
  {
    icon: Phone,
    title: "Телефон",
    value: CONTACTS.phone.label,
    href: CONTACTS.phone.href,
    hint: "Звоните в часы работы магазина",
    tint: "bg-[#e7e9ee]",
  },
  {
    icon: Mail,
    title: "Почта",
    value: CONTACTS.email,
    href: `mailto:${CONTACTS.email}`,
    hint: "Для вопросов по заказам и сотрудничества",
    tint: "bg-[#eeece8]",
  },
  {
    icon: Camera,
    title: "Instagram",
    value: CONTACTS.instagram.label,
    href: CONTACTS.instagram.href,
    hint: "Новинки и примеры образов",
    tint: "bg-[#ebeaee]",
  },
];

const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACTS.store.mapQuery)}`;

export default function ContactsPage() {
  return (
    <>
      <section className="px-6 pb-2 pt-6 text-center sm:pt-10">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Контакты</p>
        <h1 className="mt-3 text-[clamp(30px,4.6vw,56px)] font-semibold leading-[1.05] tracking-[-0.04em] text-balance text-neutral-800">
          Мы всегда{" "}
          <span className="bg-linear-to-r from-neutral-600 to-neutral-400 bg-clip-text text-transparent">на связи.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-500">
          Подскажем с размером, поможем с заказом или просто расскажем о новинках. Выберите, как вам удобнее.
        </p>
      </section>

      <section className="mx-auto mt-10 max-w-350 px-6" aria-label="Способы связи">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map(({ icon: Icon, title, value, href, hint, tint }, i) => {
            const external = href.startsWith("http");
            return (
              <li key={title}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={cn(
                    "group flex min-h-56 flex-col justify-between rounded-[2rem] p-6 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 sm:p-7",
                    tint,
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] tabular-nums text-neutral-400">{String(i + 1).padStart(2, "0")}</span>
                    <ArrowUpRight className="size-4 text-neutral-400 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-900" />
                  </div>
                  <div>
                    <Icon className="size-5 text-neutral-700" />
                    <h2 className="mt-4 text-2xl leading-none font-semibold tracking-[-0.04em] text-neutral-900">{title}</h2>
                    <p className="mt-2 text-sm font-medium break-all text-neutral-800 underline-offset-4 group-hover:underline">
                      {value}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">{hint}</p>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="store" className="mx-auto mt-24 max-w-350 scroll-mt-6 px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr] lg:gap-16">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Магазин</p>
            <h2 className="mt-3 text-[clamp(26px,3.4vw,44px)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-neutral-900">
              Приходите примерить.
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="border-t border-neutral-300 pt-4">
              <MapPin className="size-4 text-neutral-400" />
              <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em] text-neutral-900">Адрес</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {CONTACTS.store.city}
                <br />
                {CONTACTS.store.address}
              </p>
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 border-b border-neutral-900 pb-px text-xs font-medium text-neutral-900"
              >
                Открыть на карте
                <ArrowUpRight className="size-3.5" />
              </a>
            </div>

            <div className="border-t border-neutral-300 pt-4">
              <Clock className="size-4 text-neutral-400" />
              <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em] text-neutral-900">Часы работы</h3>
              <dl className="mt-2 space-y-1.5 text-sm text-neutral-600">
                {CONTACTS.store.hours.map(({ days, time }) => (
                  <div key={days} className="flex items-baseline justify-between gap-4 border-b border-neutral-200 pb-1.5 last:border-0">
                    <dt>{days}</dt>
                    <dd className="font-medium tabular-nums text-neutral-900">{time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-350 px-6">
        <div className="rounded-[2rem] bg-neutral-950 px-6 py-14 text-center text-white sm:py-20">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/50">Остались вопросы?</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-[clamp(26px,4vw,52px)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance">
            Напишите нам, ответим в течение дня.
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={CONTACTS.telegram.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-white px-6 text-neutral-950 hover:bg-neutral-200")}
            >
              <Send className="size-4" />
              Написать в Telegram
            </a>
            <a
              href={`mailto:${CONTACTS.email}`}
              className={cn(
                buttonVariants({ size: "lg", variant: "ghost" }),
                "rounded-full px-6 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Написать на почту
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
