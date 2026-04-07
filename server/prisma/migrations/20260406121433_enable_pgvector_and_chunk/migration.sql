CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "DocumentSourceType" AS ENUM ('COURSE', 'LESSON_ARTICLE', 'LESSON_VIDEO', 'LESSON_QUIZ', 'BLOG');

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "sourceType" "DocumentSourceType" NOT NULL,
    "metadata" JSONB,
    "courseId" TEXT,
    "lessonId" TEXT,
    "blogId" TEXT,
    "chunkIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentChunk_sourceType_idx" ON "DocumentChunk"("sourceType");

-- CreateIndex
CREATE INDEX "DocumentChunk_courseId_idx" ON "DocumentChunk"("courseId");

-- CreateIndex
CREATE INDEX "DocumentChunk_lessonId_idx" ON "DocumentChunk"("lessonId");

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
