import { CartPanel } from "@/components/cart/cart-panel";
import { CartProvider } from "@/components/cart/cart-provider";
import { QuickViewProvider } from "@/components/quick-view/quick-view-provider";

// Shared by the home page and the showcase: the cart and the product card live here,
// so the cart survives navigation and every page opens the same card.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <QuickViewProvider>
        {children}
        <CartPanel />
      </QuickViewProvider>
    </CartProvider>
  );
}
