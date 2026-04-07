import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/services/prisma.service';
import { z } from 'zod';

interface ConceptExtraction {
  concepts: { name: string; category: string }[];
  relations: { from: string; to: string; relation: string }[];
}

/**
 * Postgres-native Knowledge Graph service.
 * Extracts concepts from lesson content and queries related concepts
 * via recursive CTE for deep contextual retrieval.
 */
@Injectable()
export class KnowledgeGraphService {
  private readonly logger = new Logger(KnowledgeGraphService.name);
  private readonly llm: ChatOpenAI | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const routerKey = this.configService.get<string>('openrouter.apiKey');
    const model =
      this.configService.get<string>('openrouter.model') ||
      'google/gemini-2.5-flash';

    if (routerKey) {
      this.llm = new ChatOpenAI({
        modelName: model,
        openAIApiKey: routerKey,
        configuration: { baseURL: 'https://openrouter.ai/api/v1' },
        maxTokens: 1000,
      });
    }
  }

  // ===================== CONCEPT EXTRACTION =====================

  /**
   * Extract concepts and relationships from lesson content via LLM.
   * Called by the BullMQ concept.extract processor after embedding.
   */
  async extractAndStoreConcepts(
    content: string,
    chunkId: string,
  ): Promise<void> {
    if (!this.llm) return;

    try {
      const structuredLlm = this.llm.withStructuredOutput(
        z.object({
          concepts: z
            .array(
              z.object({
                name: z
                  .string()
                  .describe('Concept name, lowercase, e.g. "react hooks"'),
                category: z
                  .string()
                  .describe(
                    'One of: language, framework, library, pattern, concept, tool',
                  ),
              }),
            )
            .describe('Key technical concepts found in this text (max 8)'),
          relations: z
            .array(
              z.object({
                from: z.string().describe('Source concept name'),
                to: z.string().describe('Target concept name'),
                relation: z
                  .string()
                  .describe(
                    'One of: requires, related_to, part_of, alternative_to',
                  ),
              }),
            )
            .describe('Relationships between the extracted concepts (max 10)'),
        }),
        { name: 'concept_extraction' },
      );

      const result: ConceptExtraction = await structuredLlm.invoke([
        new SystemMessage(
          `You are a technical knowledge graph builder for a programming course platform.
Extract key technical concepts and their relationships from the following lesson content.
Be precise: use lowercase names, merge synonyms (e.g. "react.js" → "react").
Only extract genuinely distinct concepts, not generic words.`,
        ),
        new HumanMessage(content.substring(0, 2000)),
      ]);

      // Upsert concepts
      for (const concept of result.concepts) {
        await this.prisma.conceptNode.upsert({
          where: { name: concept.name.toLowerCase().trim() },
          create: {
            name: concept.name.toLowerCase().trim(),
            category: concept.category,
          },
          update: { category: concept.category },
        });
      }

      // Upsert relations
      for (const rel of result.relations) {
        const fromName = rel.from.toLowerCase().trim();
        const toName = rel.to.toLowerCase().trim();

        const fromNode = await this.prisma.conceptNode.findUnique({
          where: { name: fromName },
        });
        const toNode = await this.prisma.conceptNode.findUnique({
          where: { name: toName },
        });

        if (fromNode && toNode && fromNode.id !== toNode.id) {
          await this.prisma.conceptRelation.upsert({
            where: {
              fromId_toId_relation: {
                fromId: fromNode.id,
                toId: toNode.id,
                relation: rel.relation,
              },
            },
            create: {
              fromId: fromNode.id,
              toId: toNode.id,
              relation: rel.relation,
            },
            update: {},
          });
        }
      }

      // Link chunk to concepts
      for (const concept of result.concepts) {
        const node = await this.prisma.conceptNode.findUnique({
          where: { name: concept.name.toLowerCase().trim() },
        });
        if (node) {
          await this.prisma.documentChunkConcept.upsert({
            where: {
              chunkId_conceptId: { chunkId, conceptId: node.id },
            },
            create: { chunkId, conceptId: node.id },
            update: {},
          });
        }
      }

      this.logger.debug(
        `Extracted ${result.concepts.length} concepts, ${result.relations.length} relations for chunk ${chunkId}`,
      );
    } catch (error) {
      this.logger.warn('Concept extraction failed', error);
    }
  }

  // ===================== GRAPH TRAVERSAL =====================

  /**
   * Given a user query, find related concepts and traverse the knowledge graph
   * to retrieve contextually enriched chunks.
   */
  async enrichContext(
    userQuery: string,
    existingChunkIds: string[],
  ): Promise<string> {
    try {
      // Step 1: Find concept nodes matching keywords in query
      const queryWords = userQuery
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2);

      if (queryWords.length === 0) return '';

      const matchedConcepts = await this.prisma.conceptNode.findMany({
        where: {
          OR: queryWords.map((word) => ({
            name: { contains: word, mode: 'insensitive' as const },
          })),
        },
        take: 5,
      });

      if (matchedConcepts.length === 0) return '';

      const conceptIds = matchedConcepts.map((c) => c.id);

      // Step 2: Get related concepts via graph traversal (depth 2)
      // Using Prisma queries instead of raw SQL to avoid injection risks
      const directRelations = await this.prisma.conceptRelation.findMany({
        where: {
          OR: [{ fromId: { in: conceptIds } }, { toId: { in: conceptIds } }],
        },
        include: {
          from: true,
          to: true,
        },
      });

      // Collect depth-1 concept IDs
      const depth1Ids = new Set<string>();
      for (const rel of directRelations) {
        depth1Ids.add(rel.fromId);
        depth1Ids.add(rel.toId);
      }

      // Depth-2: relations from depth-1 concepts
      const depth2Relations = await this.prisma.conceptRelation.findMany({
        where: {
          OR: [
            { fromId: { in: Array.from(depth1Ids) } },
            { toId: { in: Array.from(depth1Ids) } },
          ],
        },
        include: {
          from: true,
          to: true,
        },
      });

      const allConceptIds = new Set<string>(conceptIds);
      for (const rel of [...directRelations, ...depth2Relations]) {
        allConceptIds.add(rel.fromId);
        allConceptIds.add(rel.toId);
      }

      // Step 3: Fetch chunks linked to these concepts, excluding existing ones
      const relatedChunkLinks = await this.prisma.documentChunkConcept.findMany(
        {
          where: {
            conceptId: { in: Array.from(allConceptIds) },
            chunkId: {
              notIn:
                existingChunkIds.length > 0 ? existingChunkIds : ['__none__'],
            },
          },
          include: {
            chunk: { select: { id: true, content: true } },
            concept: { select: { name: true } },
          },
          take: 3,
        },
      );

      if (relatedChunkLinks.length === 0) return '';

      const graphContext = relatedChunkLinks
        .map(
          (link) =>
            `[Related Concept: ${link.concept.name}]\n${link.chunk.content.substring(0, 500)}`,
        )
        .join('\n---\n');

      this.logger.debug(
        `Knowledge Graph enriched with ${relatedChunkLinks.length} related chunks`,
      );

      return `\n\n[KNOWLEDGE GRAPH — Related Concepts]\n${graphContext}`;
    } catch (error) {
      this.logger.warn('Knowledge graph enrichment failed', error);
      return '';
    }
  }
}
