/*
  Warnings:

  - You are about to drop the column `completionTimeSec` on the `QuizAttempt` table. All the data in the column will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "QuizAttempt" DROP COLUMN "completionTimeSec";

-- DropTable
DROP TABLE "Image";

-- DropTable
DROP TABLE "Video";

-- DropEnum
DROP TYPE "ImageStatus";

-- DropEnum
DROP TYPE "VideoStatus";

-- CreateTable
CREATE TABLE "media_items" (
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

    CONSTRAINT "media_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_items_storageKey_key" ON "media_items"("storageKey");

-- CreateIndex
CREATE INDEX "idx_media_user" ON "media_items"("userId");

-- CreateIndex
CREATE INDEX "idx_media_status" ON "media_items"("status");

-- CreateIndex
CREATE INDEX "idx_media_type" ON "media_items"("type");

-- CreateIndex
CREATE INDEX "idx_media_created" ON "media_items"("createdAt");

-- AddForeignKey
ALTER TABLE "media_items" ADD CONSTRAINT "media_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
