"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveProductAction } from "@/app/admin/actions";
import { ImageField } from "@/components/admin/image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES_BY_TYPE, SIZE_CHART, TYPE_ORDER } from "@/config/catalog.config";
import { PAGES } from "@/config/pages.config";
import { CATEGORY_LABEL, GENDER_LABEL, STATUS_LABEL, TYPE_HINT, TYPE_LABEL } from "@/lib/labels";
import { slugify } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Gender, ProductStatus, ProductType } from "@/generated/prisma/enums";
import type { ProductFormInitial, ProductFormValues, ProductPayload, ViewKey } from "@/types";

const VIEWS = { front: "Спереди", side: "Сбоку", back: "Сзади" };

const DEFAULTS: ProductFormValues = {
  slug: "",
  name: "",
  description: "",
  type: ProductType.TOP,
  category: CATEGORIES_BY_TYPE[ProductType.TOP][0],
  gender: Gender.UNISEX,
  color: "",
  colorHex: "#111111",
  price: "",
  compareAtPrice: "",
  status: ProductStatus.DRAFT,
  featured: false,
  sortOrder: "100",
  images: {},
};

const num = (s: string) => Number(s.trim().replace(",", "."));

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Create a product (no `initial`) or edit one. */
export function ProductForm({ initial }: { initial?: ProductFormInitial }) {
  const router = useRouter();
  const editing = Boolean(initial);

  const [v, setV] = useState<ProductFormValues>(initial?.values ?? DEFAULTS);
  const [slugTouched, setSlugTouched] = useState(editing);
  // sizes that are added now: size -> first stock (as typed)
  const [newSizes, setNewSizes] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploads, setUploads] = useState(0);
  const [pending, startTransition] = useTransition();

  const existing = initial?.sizes ?? {};
  const hanging = v.type !== ProductType.FOOTWEAR;
  const views: ViewKey[] = hanging ? ["front", "side", "back"] : ["side", "front", "back"];

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  function setType(type: ProductType) {
    setV((prev) => ({ ...prev, type, category: CATEGORIES_BY_TYPE[type][0] }));
    setNewSizes({}); // every type has its own sizes
  }

  function toggleSize(size: string, on: boolean) {
    setNewSizes((prev) => {
      const next = { ...prev };
      if (on) next[size] = "0";
      else delete next[size];
      return next;
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const payload: ProductPayload = {
      id: initial?.id,
      slug: v.slug,
      name: v.name,
      description: v.description,
      type: v.type,
      category: v.category,
      gender: v.gender,
      color: v.color,
      colorHex: v.colorHex || null,
      price: num(v.price),
      compareAtPrice: v.compareAtPrice.trim() ? num(v.compareAtPrice) : null,
      status: v.status,
      featured: v.featured,
      sortOrder: Number.parseInt(v.sortOrder, 10) || 0,
      images: v.images,
      newSizes: Object.entries(newSizes).map(([size, stock]) => ({
        size,
        stock: Math.max(0, Math.floor(num(stock) || 0)),
      })),
    };

    startTransition(async () => {
      const res = await saveProductAction(payload);
      if (res.ok) {
        setErrors({});
        if (editing) {
          setNewSizes({});
          setMessage({ ok: true, text: "Изменения сохранены." });
          router.refresh();
        } else {
          router.push(PAGES.ADMIN_PRODUCTS);
        }
        return;
      }
      setErrors(res.errors);
      setMessage({ ok: false, text: res.message ?? "Не удалось сохранить. Попробуйте ещё раз." });
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5 pb-24" noValidate>
      <Section title="Основное">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Название" error={errors.name} htmlFor="name">
            <Input
              id="name"
              value={v.name}
              aria-invalid={Boolean(errors.name)}
              onChange={(e) => {
                const name = e.target.value;
                setV((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
              }}
            />
          </Field>
          <Field label="Адрес (slug)" error={errors.slug} hint="Латиница, цифры и дефис. После создания не меняется." htmlFor="slug">
            <Input
              id="slug"
              value={v.slug}
              disabled={editing}
              aria-invalid={Boolean(errors.slug)}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Описание" error={errors.description} htmlFor="description">
              <Textarea id="description" value={v.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Тип и категория" hint={editing ? "Тип нельзя изменить после создания." : undefined}>
        <div role="radiogroup" aria-label="Тип товара" className="grid gap-3 sm:grid-cols-3">
          {TYPE_ORDER.map((type) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={v.type === type}
              disabled={editing && v.type !== type}
              onClick={() => setType(type)}
              className={cn(
                "cursor-pointer rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                v.type === type ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 hover:border-neutral-400",
              )}
            >
              <span className="block text-sm font-semibold">{TYPE_LABEL[type]}</span>
              <span className={cn("mt-1 block text-xs", v.type === type ? "text-white/60" : "text-neutral-500")}>
                {TYPE_HINT[type]}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Категория" error={errors.category} htmlFor="category">
            <Select
              id="category"
              value={v.category}
              onChange={(e) => set("category", e.target.value as ProductFormValues["category"])}
            >
              {CATEGORIES_BY_TYPE[v.type].map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Для кого" htmlFor="gender">
            <Select id="gender" value={v.gender} onChange={(e) => set("gender", e.target.value as Gender)}>
              {Object.values(Gender).map((g) => (
                <option key={g} value={g}>
                  {GENDER_LABEL[g]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Цвет и цена">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Цвет" error={errors.color} htmlFor="color">
            <Input id="color" value={v.color} aria-invalid={Boolean(errors.color)} onChange={(e) => set("color", e.target.value)} />
          </Field>
          <Field label="Оттенок" error={errors.colorHex} htmlFor="colorHex">
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Оттенок"
                value={/^#[0-9a-f]{6}$/i.test(v.colorHex) ? v.colorHex : "#111111"}
                onChange={(e) => set("colorHex", e.target.value)}
                className="size-9 shrink-0 cursor-pointer rounded-full border border-neutral-200 bg-transparent p-0.5"
              />
              <Input id="colorHex" value={v.colorHex} onChange={(e) => set("colorHex", e.target.value)} />
            </div>
          </Field>
          <Field label="Цена" error={errors.price} htmlFor="price">
            <Input id="price" inputMode="decimal" value={v.price} aria-invalid={Boolean(errors.price)} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Старая цена" error={errors.compareAtPrice} hint="Если указать, на сайте покажется скидка." htmlFor="compareAt">
            <Input
              id="compareAt"
              inputMode="decimal"
              value={v.compareAtPrice}
              aria-invalid={Boolean(errors.compareAtPrice)}
              onChange={(e) => set("compareAtPrice", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Фото" hint={hanging ? "Для вещей на рейле нужны все три фото: сбоку, спереди и сзади (лучше PNG или WebP без фона)." : "Главное фото обуви: вид сбоку носком вправо (лучше PNG или WebP без фона). Остальные по желанию."}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {views.map((view, i) => (
            <ImageField
              key={view}
              label={VIEWS[view]}
              required={hanging || i === 0}
              value={v.images[view]}
              error={errors[`images.${view}`]}
              onBusy={(busy) => setUploads((n) => n + (busy ? 1 : -1))}
              onChange={(url) => setV((prev) => ({ ...prev, images: { ...prev.images, [view]: url } }))}
            />
          ))}
        </div>
      </Section>

      <Section title="Размеры и остаток" hint={editing ? "Остаток существующих размеров меняется на складе. Здесь можно добавить новые размеры." : "Отметьте размеры и укажите, сколько штук пришло на склад."}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {SIZE_CHART[v.type].map((size) => {
            const has = size in existing;
            const on = has || size in newSizes;
            return (
              <div
                key={size}
                className={cn("rounded-2xl border p-3", on ? "border-neutral-950" : "border-neutral-200")}
              >
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={has}
                    onChange={(e) => toggleSize(size, e.target.checked)}
                    className="size-4 accent-neutral-950"
                  />
                  {size}
                </label>
                {has ? (
                  <p className="mt-2 text-xs text-neutral-500">
                    {existing[size]} шт.
                  </p>
                ) : on ? (
                  <div className="mt-2">
                    <Input
                      type="number"
                      min={0}
                      aria-label={`${size}: шт. на складе`}
                      value={newSizes[size]}
                      onChange={(e) => setNewSizes((prev) => ({ ...prev, [size]: e.target.value }))}
                      className="h-8 px-2 text-xs"
                    />
                    <p className="mt-1 text-[10px] text-neutral-400">шт. на складе</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {errors.sizes && <p className="mt-3 text-xs text-destructive">{errors.sizes}</p>}
        {editing && (
          <Link href={PAGES.ADMIN_STOCK} className="mt-4 inline-block text-xs text-neutral-900 underline underline-offset-4">
            Изменить на складе
          </Link>
        )}
      </Section>

      <Section title="Публикация">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Статус" hint="Только «Активен» виден покупателям." htmlFor="status">
            <Select id="status" value={v.status} onChange={(e) => set("status", e.target.value as ProductStatus)}>
              {Object.values(ProductStatus).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Порядок" hint="Чем меньше число, тем раньше в списках." htmlFor="sortOrder">
            <Input id="sortOrder" type="number" value={v.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
          </Field>
          <label className="flex cursor-pointer items-center gap-2 self-end pb-2 text-sm">
            <input
              type="checkbox"
              checked={v.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="size-4 accent-neutral-950"
            />
            Показывать на главной
          </label>
        </div>
      </Section>

      {/* the save bar stays visible while the form is long */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <p
            role="status"
            className={cn("min-w-0 flex-1 truncate text-xs", message?.ok ? "text-emerald-700" : "text-destructive")}
          >
            {message?.text}
          </p>
          <Button type="button" variant="ghost" onClick={() => router.push(PAGES.ADMIN_PRODUCTS)} className="rounded-full">
            Отмена
          </Button>
          <Button type="submit" disabled={pending || uploads > 0} className="rounded-full px-6">
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Сохраняем…
              </>
            ) : (
              "Сохранить"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
