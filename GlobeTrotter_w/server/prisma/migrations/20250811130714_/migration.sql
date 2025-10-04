/*
  Warnings:

  - You are about to drop the column `currency` on the `Trip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "currency",
ADD COLUMN     "budget" DECIMAL(10,2);
