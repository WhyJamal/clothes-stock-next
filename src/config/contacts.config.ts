// Contact details of the store (the Contacts page and the footer). Replace the placeholders with the real ones.
export const CONTACTS = {
  email: "hello@shimitsu.example",
  phone: { label: "+998 00 000 00 00", href: "tel:+998000000000" },
  telegram: { label: "@shimitsu", href: "https://t.me/shimitsu" },
  instagram: { label: "@shimitsu", href: "https://instagram.com/shimitsu" },
  store: {
    city: "Ташкент",
    address: "ул. Примерная, 1",
    /** The "Open on the map" button searches for this text. */
    mapQuery: "Ташкент, ул. Примерная, 1",
    hours: [
      { days: "Пн – Пт", time: "10:00 – 20:00" },
      { days: "Сб – Вс", time: "11:00 – 19:00" },
    ],
  },
} as const;
