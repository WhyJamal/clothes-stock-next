import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Role } from "../src/generated/prisma/enums";

// npm run db:admin -- you@mail.com      makes an existing user an admin
// npm run db:admin -- you@mail.com user takes the role away

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const role = process.argv[3] === "user" ? Role.USER : Role.ADMIN;
  if (!email) throw new Error("Usage: npm run db:admin -- you@mail.com [user]");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`No user with the email ${email}. Sign up on the site first.`);

  await prisma.user.update({ where: { id: user.id }, data: { role } });
  console.log(`✓ ${email} is now ${role}`);
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
