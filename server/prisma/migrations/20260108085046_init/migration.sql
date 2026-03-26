/*
  Warnings:

  - You are about to drop the column `readingMin` on the `LessonArticle` table. All the data in the column will be lost.
  - You are about to drop the column `timeLimitSec` on the `LessonQuiz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "description" TEXT,
ADD COLUMN     "durationSec" INTEGER;

-- AlterTable
ALTER TABLE "LessonArticle" DROP COLUMN "readingMin",
ADD COLUMN     "durationSec" INTEGER;

-- AlterTable
ALTER TABLE "LessonQuiz" DROP COLUMN "timeLimitSec",
ADD COLUMN     "durationSec" INTEGER;
