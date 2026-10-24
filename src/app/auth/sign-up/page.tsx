import type { Metadata } from "next";
import { SignUpCard } from "@/components/auth/sign-up-card";
import { t } from "@/lib/content";

export const metadata: Metadata = {
  title: t.auth.signUp.metaTitle,
};

export default function SignUpPage() {
  return <SignUpCard />;
}
