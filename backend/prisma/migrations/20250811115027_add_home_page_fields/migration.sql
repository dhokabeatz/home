-- AlterTable
ALTER TABLE "users" ADD COLUMN     "clientSatisfaction" INTEGER DEFAULT 100,
ADD COLUMN     "heroDescription" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "projectsCompleted" INTEGER DEFAULT 50,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "yearsExperience" INTEGER DEFAULT 3;
