-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Trip_isPublic_idx" ON "Trip"("isPublic");
