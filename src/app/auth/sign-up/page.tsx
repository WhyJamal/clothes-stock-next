import type { Metadata } from "next";
import { SignUpCard } from "@/components/auth/sign-up-card";

export const metadata: Metadata = {
  title: "Shimitsu · Регистрация",
};

export default function SignUpPage() {
  return <SignUpCard />;
}
