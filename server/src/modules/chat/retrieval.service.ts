import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from 'src/shared/services/prisma.service';
import { z } from 'zod';

export interface RetrievedChunk {
  id: string;
  content: string;
  distance: number;
  textRank: number;
  rrf: number;
  sourceType: string;
  courseId: string | null;
  lessonId: string | null;
}

@Injectable()
export class RetrievalService {
  private readonly logger = new Logger(RetrievalService.name);
  private readonly openai: OpenAI;
  private readonly llm: ChatOpenAI | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.openai = new OpenAI();

    const routerKey = this.configService.get<string>('openrouter.apiKey');
    const model =
      this.configService.get<string>('openrouter.model') ||
      'google/gemini-2.5-flash';

    if (routerKey) {
      this.llm = new ChatOpenAI({
        modelName: model,
        openAIApiKey: routerKey,
        configuration: { baseURL: 'https://openrouter.ai/api/v1' },
        maxTokens: 500,
      });
    }
  }

  // ===================== 1. QUERY EXPANSION (HyDE) =====================

  /**
   * Expand a short/vague user query into a detailed hypothetical answer
   * to improve embedding similarity match.
   */
  async expandQuery(userMessage: string): Promise<string> {
    if (!this.llm || userMessage.split(/\s+/).length > 12) {
      // Skip expansion for already-detailed queries (>12 words)
      return userMessage;
    }

    try {
      const response = await this.llm.invoke([
        new SystemMessage(
          `You are a technical writing assistant for a programming course platform.
Given a user's short question, write a detailed 2-3 sentence hypothetical answer 
that a course lesson might contain. Include relevant technical keywords.
Reply with ONLY the hypothetical answer text, no preamble.`,
        ),
        new HumanMessage(userMessage),
      ]);

      const expanded =
        typeof response.content === 'string'
          ? response.content.trim()
          : JSON.stringify(response.content);
      this.logger.debug(
        `Query expanded: "${userMessage}" → "${expanded.substring(0, 100)}..."`,
      );
      return expanded;
    } catch (error) {
      this.logger.warn('Query expansion failed, using original query', error);
      return userMessage;
    }
  }

  // ===================== 2. HYBRID SEARCH (Vector + Full-Text) =====================

  /**
   * Performs hybrid search combining semantic vector similarity and
   * keyword-based full-text search using Reciprocal Rank Fusion (RRF).
   */
  async hybridSearch(
    userMessage: string,
    expandedQuery: string,
    topK: number = 20,
  ): Promise<RetrievedChunk[]> {
    try {
      // Generate embedding from the expanded query for better semantic match
      const embRes = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: expandedQuery,
      });
      const vectorStr = `[${embRes.data[0].embedding.join(',')}]`;

      // Hybrid SQL: combine vector cosine distance + full-text rank via RRF
      // RRF formula: score = 1/(k+rank_vector) + 1/(k+rank_text), k=60
      const chunks: RetrievedChunk[] = await this.prisma.$queryRawUnsafe(
        `
        WITH vector_ranked AS (
          SELECT id, content, "sourceType", "courseId", "lessonId",
                 embedding <=> $1::vector AS distance,
                 ROW_NUMBER() OVER (ORDER BY embedding <=> $1::vector ASC) AS vrank
          FROM "DocumentChunk"
          ORDER BY distance ASC
          LIMIT $3
        ),
        text_ranked AS (
          SELECT id, content, "sourceType", "courseId", "lessonId",
                 ts_rank_cd("searchVector", plainto_tsquery('english', $2)) AS text_rank,
                 ROW_NUMBER() OVER (ORDER BY ts_rank_cd("searchVector", plainto_tsquery('english', $2)) DESC) AS trank
          FROM "DocumentChunk"
          WHERE "searchVector" @@ plainto_tsquery('english', $2)
          ORDER BY text_rank DESC
          LIMIT $3
        ),
        combined AS (
          SELECT 
            COALESCE(v.id, t.id) AS id,
            COALESCE(v.content, t.content) AS content,
            COALESCE(v."sourceType", t."sourceType") AS "sourceType",
            COALESCE(v."courseId", t."courseId") AS "courseId",
            COALESCE(v."lessonId", t."lessonId") AS "lessonId",
            COALESCE(v.distance, 1.0) AS distance,
            COALESCE(t.text_rank, 0.0) AS "textRank",
            (1.0 / (60 + COALESCE(v.vrank, $3 + 1))) + 
            (1.0 / (60 + COALESCE(t.trank, $3 + 1))) AS rrf
          FROM vector_ranked v
          FULL OUTER JOIN text_ranked t ON v.id = t.id
        )
        SELECT id, content, "sourceType", "courseId", "lessonId", 
               distance::float8 AS distance, 
               "textRank"::float8 AS "textRank", 
               rrf::float8 AS rrf
        FROM combined
        ORDER BY rrf DESC
        LIMIT $3;
        `,
        vectorStr,
        userMessage,
        topK,
      );

      this.logger.debug(`Hybrid search returned ${chunks.length} candidates`);
      return chunks;
    } catch (error) {
      this.logger.error('Hybrid search failed', error);
      return [];
    }
  }

  // ===================== 3. LLM-BASED RERANKING =====================

  /**
   * Uses the LLM to rerank candidate chunks by relevance to the user query.
   * Returns the top-N most relevant chunks.
   */
  async rerank(
    userQuery: string,
    candidates: RetrievedChunk[],
    topN: number = 4,
  ): Promise<RetrievedChunk[]> {
    if (!this.llm || candidates.length <= topN) {
      return candidates.slice(0, topN);
    }

    try {
      const candidateList = candidates
        .map((c, i) => `[${i}] ${c.content.substring(0, 300)}`)
        .join('\n\n');

      const structuredLlm = this.llm.withStructuredOutput(
        z.object({
          rankedIndices: z
            .array(z.number())
            .describe(
              `Array of ${topN} candidate indices ranked by relevance to the query, most relevant first`,
            ),
        }),
        { name: 'rerank_result' },
      );

      const result = await structuredLlm.invoke([
        new SystemMessage(
          `You are a relevance judge. Given a user query and numbered text candidates, 
select the ${topN} MOST RELEVANT candidates. Return their indices ordered by relevance (best first).
Only return indices that exist in the candidate list.`,
        ),
        new HumanMessage(
          `Query: "${userQuery}"\n\nCandidates:\n${candidateList}`,
        ),
      ]);

      const reranked = result.rankedIndices
        .filter((i: number) => i >= 0 && i < candidates.length)
        .slice(0, topN)
        .map((i: number) => candidates[i]);

      this.logger.debug(
        `Reranked ${candidates.length} → ${reranked.length} chunks`,
      );
      return reranked.length > 0 ? reranked : candidates.slice(0, topN);
    } catch (error) {
      this.logger.warn('LLM reranking failed, using RRF order', error);
      return candidates.slice(0, topN);
    }
  }
}
