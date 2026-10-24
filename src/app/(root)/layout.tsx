import { CartProvider } from "@/components/cart/cart-provider";

// Shared by the home page and the showcase: the cart lives here, so it survives navigation.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
