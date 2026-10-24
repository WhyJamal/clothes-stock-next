import type { Metadata } from "next";
import { SignInCard } from "@/components/auth/sign-in-card";
import { t } from "@/lib/content";

export const metadata: Metadata = {
  title: t.auth.signIn.metaTitle,
};

export default function SignInPage() {
  return <SignInCard />;
}
