/*
  Warnings:

  - You are about to drop the column `customCity` on the `TripStop` table. All the data in the column will be lost.
  - You are about to drop the column `orderIndex` on the `TripStop` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "TripStop_tripId_orderIndex_idx";

-- AlterTable
ALTER TABLE "TripStop" DROP COLUMN "customCity",
DROP COLUMN "orderIndex";
