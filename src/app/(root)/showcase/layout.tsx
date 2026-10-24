import { Header } from "@/components/header";

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#fbfafc]">
      <Header />
      {children}
    </div>
  );
}
