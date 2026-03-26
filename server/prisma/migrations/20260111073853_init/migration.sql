/*
  Warnings:

  - You are about to drop the `media_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "media_items" DROP CONSTRAINT "media_items_userId_fkey";

-- DropTable
DROP TABLE "media_items";

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "thumbnailKey" TEXT,
    "cdnBaseUrl" TEXT NOT NULL,
    "hlsPlaylistKey" TEXT,
    "duration" DOUBLE PRECISION,
    "status" "MediaStatus" NOT NULL DEFAULT 'UPLOADING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_storageKey_key" ON "Media"("storageKey");

-- CreateIndex
CREATE INDEX "idx_media_user" ON "Media"("userId");

-- CreateIndex
CREATE INDEX "idx_media_status" ON "Media"("status");

-- CreateIndex
CREATE INDEX "idx_media_type" ON "Media"("type");

-- CreateIndex
CREATE INDEX "idx_media_created" ON "Media"("createdAt");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
