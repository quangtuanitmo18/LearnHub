import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

/**
 * Service responsible for dispatching document embedding jobs to BullMQ.
 * Call `enqueueContent()` whenever lesson/course content is created or updated
 * so that the RAG pipeline has fresh embeddings to search over.
 */
@Injectable()
export class EmbedService {
  private readonly logger = new Logger(EmbedService.name);

  constructor(@InjectQueue('ai-embed') private readonly embedQueue: Queue) {}

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
