const ITEMS = [
  { n: "01", title: "Плотный футер", text: "Тяжёлый хлопок, который держит форму и приятен к телу." },
  { n: "02", title: "Свободный крой", text: "Оверсайз-посадка, в которой удобно и в городе, и в дороге." },
  { n: "03", title: "Сделано надолго", text: "Прочные швы и фурнитура: вещи служат годами, а не сезон." },
];

/** Three short promises, set as a big typographic row (no cards, no icons). */
export function Values() {
  return (
    <section className="mx-auto mt-24 max-w-350 px-6">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr] lg:gap-16">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Почему Shimitsu</p>
          <h2 className="mt-3 text-[clamp(26px,3.4vw,44px)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-neutral-900">
            Одежда, которую хочется носить каждый день.
          </h2>
        </div>

        <ol className="grid gap-8 sm:grid-cols-3">
          {ITEMS.map(({ n, title, text }) => (
            <li key={n} className="border-t border-neutral-300 pt-4">
              <span className="text-xs tabular-nums text-neutral-400">{n}</span>
              <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em] text-neutral-900">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
