import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#fbfafc]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
