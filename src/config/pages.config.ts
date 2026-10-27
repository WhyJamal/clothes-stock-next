export const PAGES = {
  HOME: "/",
  SHOWCASE: "/showcase",
  CONTACTS: "/contacts",

  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_NEW_PRODUCT: "/admin/products/new",
  ADMIN_STOCK: "/admin/stock",
  ADMIN_HISTORY: "/admin/stock/history",

  SIGNIN: "/auth/sign-in",
  SIGNUP: "/auth/sign-up",
} as const;

/** Page of one product, by its slug (the readable id from the database). */
export const productHref = (slug: string) => `/product/${slug}`;
