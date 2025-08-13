/*
  Warnings:

  - You are about to drop the column `clientSatisfaction` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `heroDescription` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `projectsCompleted` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tagline` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `yearsExperience` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "clientSatisfaction",
DROP COLUMN "heroDescription",
DROP COLUMN "phone",
DROP COLUMN "projectsCompleted",
DROP COLUMN "tagline",
DROP COLUMN "yearsExperience";
