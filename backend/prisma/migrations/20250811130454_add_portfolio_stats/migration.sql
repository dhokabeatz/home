-- AlterTable
ALTER TABLE "users" ADD COLUMN     "clientSatisfaction" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "yearsExperience" INTEGER NOT NULL DEFAULT 3;
