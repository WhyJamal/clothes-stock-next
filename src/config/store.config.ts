// Store-wide settings. Prices in the database have no currency: it is set once, here.
export const STORE = {
  name: "Shimitsu",
  currency: {
    code: "USD",
    symbol: "$",
    /** "before" -> $199.00, "after" -> 199.00 сум */
    position: "before" as "before" | "after",
    /** Digits after the dot in full prices (0 for currencies like UZS). */
    fractionDigits: 2,
  },
  /** Dates in the admin are shown in this time zone. */
  timeZone: "Asia/Tashkent",
  /** Free delivery starts from this amount (shown in texts). */
  freeShippingFrom: 150,
} as const;
