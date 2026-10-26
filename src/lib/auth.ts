import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validation";
import { PAGES } from "@/config/pages.config";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: PAGES.SIGNIN },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        // accounts made through Google have no password
        if (!user?.passwordHash) return null;

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      const email = profile?.email?.toLowerCase();
      if (!email || !(profile as { email_verified?: boolean }).email_verified) return false;

      // first Google sign-in creates the user, the next ones just refresh name/photo
      await prisma.user.upsert({
        where: { email },
        update: { name: profile?.name ?? email, image: (profile as { picture?: string }).picture },
        create: {
          email,
          name: profile?.name ?? email,
          image: (profile as { picture?: string }).picture,
        },
      });
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && token.email) {
        // `user.id` is Google's id here; we want our own database id
        const dbUser = await prisma.user.findUnique({ where: { email: token.email.toLowerCase() } });
        if (dbUser) token.id = dbUser.id;
      } else if (user) {
        token.id = user.id;
      }
      // The role is read when the user signs in and only decides whether the admin link is shown.
      // Every admin page and action asks the database again (see src/lib/admin.ts).
      if (token.id && (user || account)) {
        const row = await prisma.user.findUnique({ where: { id: token.id }, select: { role: true } });
        token.role = row?.role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
  },
};
