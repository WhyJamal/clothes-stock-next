import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { t } from "@/lib/content";

// Inter has a Cyrillic subset (needed for the Russian texts).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
