/*
  Warnings:

  - You are about to drop the column `contentType` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `preview` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `Lesson` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'ARTICLE', 'QUIZ');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'TRUE_FALSE');

-- DropIndex
DROP INDEX "idx_lesson_content_type";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "contentType",
DROP COLUMN "duration",
DROP COLUMN "isPublished",
DROP COLUMN "preview",
DROP COLUMN "resourceId",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "type" "LessonType" NOT NULL,
ALTER COLUMN "order" SET DEFAULT 0;

-- DropEnum
DROP TYPE "LessonContentType";

-- CreateTable
CREATE TABLE "LessonArticle" (
    "lessonId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readingMin" INTEGER,

    CONSTRAINT "LessonArticle_pkey" PRIMARY KEY ("lessonId")
);

-- CreateTable
CREATE TABLE "LessonVideo" (
    "lessonId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "durationSec" INTEGER,

    CONSTRAINT "LessonVideo_pkey" PRIMARY KEY ("lessonId")
);

-- CreateTable
CREATE TABLE "LessonQuiz" (
    "lessonId" TEXT NOT NULL,
    "timeLimitSec" INTEGER,
    "passScore" INTEGER,
    "maxAttempts" INTEGER,

    CONSTRAINT "LessonQuiz_pkey" PRIMARY KEY ("lessonId")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "text" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestionCorrectOption" (
    "questionId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "QuizQuestionCorrectOption_pkey" PRIMARY KEY ("questionId","optionId")
);

-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_order_idx" ON "QuizQuestion"("quizId", "order");

-- CreateIndex
CREATE INDEX "QuizOption_questionId_order_idx" ON "QuizOption"("questionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_slug_key" ON "Lesson"("slug");

-- CreateIndex
CREATE INDEX "Lesson_type_idx" ON "Lesson"("type");

-- AddForeignKey
ALTER TABLE "LessonArticle" ADD CONSTRAINT "LessonArticle_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonVideo" ADD CONSTRAINT "LessonVideo_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonQuiz" ADD CONSTRAINT "LessonQuiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "LessonQuiz"("lessonId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionCorrectOption" ADD CONSTRAINT "QuizQuestionCorrectOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionCorrectOption" ADD CONSTRAINT "QuizQuestionCorrectOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "QuizOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
