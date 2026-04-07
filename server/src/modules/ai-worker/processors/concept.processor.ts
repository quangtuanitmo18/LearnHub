import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { KnowledgeGraphService } from '../../chat/knowledge-graph.service';

/**
 * BullMQ processor for concept extraction jobs.
 * Runs after document embedding to populate the Knowledge Graph.
 */
@Processor('ai-concept')
@Injectable()
export class ConceptProcessor extends WorkerHost {
  constructor(private readonly knowledgeGraphService: KnowledgeGraphService) {
    super();
  }

  async process(
    job: Job<{ content: string; chunkId: string }, any, string>,
  ): Promise<any> {
    switch (job.name) {
      case 'concept.extract':
        return this.handleConceptExtract(job.data);
      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  }

  private async handleConceptExtract(data: {
    content: string;
    chunkId: string;
  }) {
    await this.knowledgeGraphService.extractAndStoreConcepts(
      data.content,
      data.chunkId,
    );
    return { success: true };
  }
}
