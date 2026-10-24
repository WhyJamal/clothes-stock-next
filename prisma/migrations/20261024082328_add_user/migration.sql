-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;
