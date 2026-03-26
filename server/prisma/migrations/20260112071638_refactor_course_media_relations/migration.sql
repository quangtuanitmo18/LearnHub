/*
  Warnings:

  - You are about to drop the column `image` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `previewImages` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "image",
DROP COLUMN "previewImages",
ADD COLUMN     "imageId" TEXT;

-- CreateTable
CREATE TABLE "_CoursePreviewImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoursePreviewImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CoursePreviewImages_B_index" ON "_CoursePreviewImages"("B");

-- CreateIndex
CREATE INDEX "idx_course_image" ON "Course"("imageId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePreviewImages" ADD CONSTRAINT "_CoursePreviewImages_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePreviewImages" ADD CONSTRAINT "_CoursePreviewImages_B_fkey" FOREIGN KEY ("B") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
