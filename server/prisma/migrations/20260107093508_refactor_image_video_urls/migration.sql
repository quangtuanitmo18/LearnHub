/*
  Warnings:

  - You are about to drop the column `originalKey` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `hlsMasterKey` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `originalKey` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailKey` on the `Video` table. All the data in the column will be lost.
  - Made the column `url` on table `Image` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "originalKey",
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "width" INTEGER,
ALTER COLUMN "url" SET NOT NULL;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "hlsMasterKey",
DROP COLUMN "originalKey",
DROP COLUMN "thumbnailKey",
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "width" INTEGER;

-- CreateIndex
CREATE INDEX "idx_image_created" ON "Image"("createdAt");

-- CreateIndex
CREATE INDEX "idx_video_created" ON "Video"("createdAt");
