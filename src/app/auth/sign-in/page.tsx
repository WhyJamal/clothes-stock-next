import type { Metadata } from "next";
import { SignInCard } from "@/components/auth/sign-in-card";

export const metadata: Metadata = {
  title: "Shimitsu · Вход",
};

export default function SignInPage() {
  return <SignInCard />;
}
