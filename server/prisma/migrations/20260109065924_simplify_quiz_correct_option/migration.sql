/*
  Warnings:

  - You are about to drop the `QuizQuestionCorrectOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuizQuestionCorrectOption" DROP CONSTRAINT "QuizQuestionCorrectOption_optionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestionCorrectOption" DROP CONSTRAINT "QuizQuestionCorrectOption_questionId_fkey";

-- AlterTable
ALTER TABLE "QuizOption" ADD COLUMN     "isCorrect" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "QuizQuestionCorrectOption";
