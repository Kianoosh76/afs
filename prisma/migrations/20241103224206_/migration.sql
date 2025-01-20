/*
  Warnings:

  - Made the column `updatedAt` on table `airlines` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `airports` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `flights` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "airlines" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "airports" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "flights" ALTER COLUMN "updatedAt" SET NOT NULL;
