/*
  Warnings:

  - You are about to drop the column `description` on the `Video` table. All the data in the column will be lost.
  - Added the required column `filename` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalKey` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('UPLOADING', 'READY', 'ERROR');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'ERROR');

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "description",
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "hlsMasterKey" TEXT,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalKey" TEXT NOT NULL,
ADD COLUMN     "processProgress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "qualities" TEXT[],
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "status" "VideoStatus" NOT NULL DEFAULT 'UPLOADING',
ADD COLUMN     "thumbnailKey" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "originalKey" TEXT NOT NULL,
    "url" TEXT,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" "ImageStatus" NOT NULL DEFAULT 'UPLOADING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_image_status" ON "Image"("status");

-- CreateIndex
CREATE INDEX "idx_video_status" ON "Video"("status");
