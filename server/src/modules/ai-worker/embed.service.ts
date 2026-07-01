import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from 'src/shared/services/prisma.service';

/**
 * Service responsible for dispatching document embedding jobs to BullMQ.
 * Call `enqueueContent()` whenever lesson/course content is created or updated
 * so that the RAG pipeline has fresh embeddings to search over.
 */
@Injectable()
export class EmbedService {
  private readonly logger = new Logger(EmbedService.name);

  constructor(
    @InjectQueue('ai-embed') private readonly embedQueue: Queue,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Split content into chunks and dispatch embedding jobs.
   * Each chunk becomes a row in DocumentChunk with its own vector.
   */
  async enqueueContent(params: {
    content: string;
    sourceType:
      | 'COURSE'
      | 'LESSON_ARTICLE'
      | 'LESSON_VIDEO'
      | 'LESSON_QUIZ'
      | 'BLOG';
    courseId?: string;
    lessonId?: string;
    blogId?: string;
  }): Promise<void> {
    const { content, sourceType, courseId, lessonId, blogId } = params;

    if (!content || content.trim().length < 20) {
      this.logger.debug('Content too short, skipping embedding');
      return;
    }

    // Delete existing chunks to prevent duplicates on update
    await this.clearContent({ blogId, lessonId, courseId });

    // Strip HTML tags for cleaner embeddings
    const cleanText = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Split into chunks of ~500 words with 50-word overlap
    const chunks = this.chunkText(cleanText, 500, 50);

    for (let i = 0; i < chunks.length; i++) {
      await this.embedQueue.add(
        'document.embed',
        {
          content: chunks[i],
          sourceType,
          courseId: courseId || null,
          lessonId: lessonId || null,
          blogId: blogId || null,
          chunkIndex: i,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );
    }

    this.logger.log(
      `Enqueued ${chunks.length} embedding jobs for ${sourceType} (lesson: ${lessonId || 'N/A'})`,
    );
  }

  /**
   * Clear existing chunks for a resource to avoid duplicates.
   */
  async clearContent(params: {
    blogId?: string;
    lessonId?: string;
    courseId?: string;
  }): Promise<void> {
    const { blogId, lessonId, courseId } = params;
    try {
      if (blogId) {
        await this.prismaService.documentChunk.deleteMany({
          where: { blogId },
        });
        this.logger.debug(`Cleared chunks for blog: ${blogId}`);
      } else if (lessonId) {
        await this.prismaService.documentChunk.deleteMany({
          where: { lessonId },
        });
        this.logger.debug(`Cleared chunks for lesson: ${lessonId}`);
      } else if (courseId) {
        await this.prismaService.documentChunk.deleteMany({
          where: { courseId, lessonId: null, blogId: null },
        });
        this.logger.debug(`Cleared chunks for course: ${courseId}`);
      }
    } catch (err) {
      this.logger.error('Failed to clear document chunks', err);
    }
  }

  /**
   * Split text into overlapping chunks by word count.
   */
  private chunkText(
    text: string,
    chunkSize: number,
    overlap: number,
  ): string[] {
    const words = text.split(/\s+/);
    if (words.length <= chunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < words.length) {
      const end = Math.min(start + chunkSize, words.length);
      chunks.push(words.slice(start, end).join(' '));
      start += chunkSize - overlap;
    }

    return chunks;
  }
}
