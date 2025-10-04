/*
  Warnings:

  - You are about to drop the column `country` on the `TripStop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TripStop" DROP COLUMN "country",
ADD COLUMN     "city" TEXT;
