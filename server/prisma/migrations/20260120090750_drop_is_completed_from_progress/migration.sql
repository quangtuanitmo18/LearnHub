/*
  Warnings:

  - You are about to drop the column `completedAt` on the `UserLessonProgress` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `UserLessonProgress` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_user_lesson_progress_completed";

-- AlterTable
ALTER TABLE "UserLessonProgress" DROP COLUMN "completedAt",
DROP COLUMN "isCompleted";
