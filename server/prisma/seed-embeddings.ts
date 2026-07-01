import 'dotenv/config';
import OpenAI from 'openai';
import { PrismaClient } from '../src/generated/prisma/client';

import { PrismaPg } from '@prisma/adapter-pg';

/**
 * One-time script to embed all existing content into DocumentChunk table.
 * Run: npx ts-node -r tsconfig-paths/register prisma/seed-embeddings.ts
 */
async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  } as any);
  const prisma = new PrismaClient({ adapter });
  const jinaKey = process.env.JINA_API_KEY;

  if (!jinaKey) {
    console.error('❌ JINA_API_KEY not set in .env');
    process.exit(1);
  }

  const jina = new OpenAI({
    apiKey: jinaKey,
    baseURL: 'https://api.jina.ai/v1',
  });

  // Helper: strip HTML tags
  const stripHtml = (html: string) =>
    html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  // Helper: chunk text by words
  const chunkText = (text: string, size = 500, overlap = 50): string[] => {
    const words = text.split(/\s+/);
    if (words.length <= size) return [text];
    const chunks: string[] = [];
    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + size, words.length);
      chunks.push(words.slice(start, end).join(' '));
      start += size - overlap;
    }
    return chunks;
  };

  // Helper: embed and insert chunks
  const embedAndInsert = async (
    content: string,
    sourceType: string,
    courseId: string | null,
    lessonId: string | null,
    blogId: string | null = null,
  ) => {
    const cleanText = stripHtml(content);
    if (cleanText.length < 20) return 0;

    const chunks = chunkText(cleanText);
    let inserted = 0;

    for (let i = 0; i < chunks.length; i++) {
      const response = await jina.embeddings.create({
        model: 'jina-embeddings-v4',
        input: chunks[i],
        dimensions: 1024,
      } as any);
      const embedding = response.data[0].embedding;
      const vectorStr = `[${embedding.join(',')}]`;

      await prisma.$queryRawUnsafe(
        `INSERT INTO "DocumentChunk" ("id", "content", "embedding", "sourceType", "courseId", "lessonId", "blogId", "chunkIndex", "createdAt")
         VALUES (gen_random_uuid(), $1, $2::vector, $3::"DocumentSourceType", $4, $5, $6, $7, NOW())`,
        chunks[i],
        vectorStr,
        sourceType,
        courseId,
        lessonId,
        blogId,
        i,
      );
      inserted++;
    }
    return inserted;
  };

  console.log('🧹 Clearing existing DocumentChunk records...');
  await prisma.$executeRawUnsafe('DELETE FROM "DocumentChunk";');
  console.log('🚀 Starting bulk embedding...\n');

  // 1. Embed course descriptions
  const courses = await prisma.course.findMany({
    where: { description: { not: '' } },
    select: { id: true, title: true, description: true },
  });

  let total = 0;
  for (const course of courses) {
    if (!course.description) continue;
    const count = await embedAndInsert(
      course.description,
      'COURSE',
      course.id,
      null,
    );
    console.log(`✅ Course "${course.title}" → ${count} chunks`);
    total += count;
  }

  // 2. Embed lesson articles
  const articles = await prisma.lessonArticle.findMany({
    where: { content: { not: '' } },
    include: { lesson: { select: { id: true, title: true, courseId: true } } },
  });

  for (const article of articles) {
    if (!article.content) continue;
    const count = await embedAndInsert(
      article.content,
      'LESSON_ARTICLE',
      article.lesson.courseId,
      article.lessonId,
    );
    console.log(`✅ Article "${article.lesson.title}" → ${count} chunks`);
    total += count;
  }

  // 3. Embed lesson descriptions (title + description as one chunk)
  const lessons = await prisma.lesson.findMany({
    where: { description: { not: '' } },
    select: { id: true, title: true, description: true, courseId: true },
  });

  for (const lesson of lessons) {
    if (!lesson.description) continue;
    const text = `${lesson.title}: ${lesson.description}`;
    const count = await embedAndInsert(
      text,
      'LESSON_ARTICLE',
      lesson.courseId,
      lesson.id,
    );
    console.log(`✅ Lesson desc "${lesson.title}" → ${count} chunks`);
    total += count;
  }

  // 4. Embed published blogs
  const blogs = await prisma.blog.findMany({
    where: { status: 'PUBLISHED', content: { not: '' } },
    select: { id: true, title: true, content: true },
  });

  for (const blog of blogs) {
    if (!blog.content) continue;
    const count = await embedAndInsert(
      blog.content,
      'BLOG',
      null,
      null,
      blog.id,
    );
    console.log(`✅ Blog "${blog.title}" → ${count} chunks`);
    total += count;
  }

  console.log(`\n🎉 Done! Total ${total} chunks embedded.`);
  await prisma.$disconnect();
}

main().catch(console.error);
