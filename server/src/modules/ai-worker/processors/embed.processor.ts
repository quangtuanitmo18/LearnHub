import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import OpenAI from 'openai';
import { PrismaService } from 'src/shared/services/prisma.service';

@Processor('ai-embed')
export class EmbedProcessor extends WorkerHost {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @InjectQueue('ai-concept') private readonly conceptQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'document.embed':
        return this.handleDocumentEmbed(job.data);
      default:
        throw new Error('Unknown job name');
    }
  }

  private async handleDocumentEmbed(data: any) {
    const { content, sourceType, courseId, lessonId, blogId, chunkIndex } =
      data;
    const openai = new OpenAI();

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
    });
    const embedding = response.data[0].embedding;
    const vectorLiteral = `[${embedding.join(',')}]`;

    // Insert chunk and return its ID for concept linking
    const result: { id: string }[] = await this.prisma.$queryRawUnsafe(
      `
      INSERT INTO "DocumentChunk" (
        "id", "content", "embedding", "sourceType", 
        "courseId", "lessonId", "blogId", "chunkIndex", "createdAt"
      )
      VALUES (
        gen_random_uuid(), 
        $1, 
        $2::vector, 
        $3::"DocumentSourceType", 
        $4, 
        $5, 
        $6, 
        $7, 
        NOW()
      )
      RETURNING "id"
    `,
      content,
      vectorLiteral,
      sourceType,
      courseId || null,
      lessonId || null,
      blogId || null,
      chunkIndex || 0,
    );

    const chunkId = result[0]?.id;

    // Dispatch concept extraction job for Knowledge Graph
    if (chunkId && content.length > 50) {
      await this.conceptQueue.add(
        'concept.extract',
        { content, chunkId },
        {
          attempts: 2,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: 50,
          removeOnFail: 20,
        },
      );
    }

    return { success: true, chunkId };
  }
}
