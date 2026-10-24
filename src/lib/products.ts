import { STORE } from "@/config/store.config";

// Formatting is done by hand (not with Intl) so the server and the browser always print
// exactly the same text. Changing the currency is a change in store.config.ts only.
const NBSP = "\u00a0";

function format(price: number, digits: number) {
  const [int, frac] = price.toFixed(digits).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  const num = frac ? `${grouped}.${frac}` : grouped;
  const { symbol, position } = STORE.currency;
  return position === "before" ? `${symbol}${num}` : `${num}${NBSP}${symbol}`;
}

export const formatPrice = (price: number) => format(price, STORE.currency.fractionDigits);
export const formatPriceShort = (price: number) => format(Math.round(price), 0);
