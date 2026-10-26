import { STORE } from "@/config/store.config";

const date = new Intl.DateTimeFormat("ru-RU", {
  timeZone: STORE.timeZone,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// Use these in server components only: they print the same text for everybody.
export const formatDateTime = (iso: string) => date.format(new Date(iso));

/** Russian transliteration for URL slugs: "Худи Varsity" -> "hudi-varsity". */
const RU: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k",
  л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => RU[c] ?? "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
