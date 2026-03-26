-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "previewImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
