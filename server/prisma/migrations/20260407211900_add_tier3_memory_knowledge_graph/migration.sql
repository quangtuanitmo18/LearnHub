-- Tier 3: Long-Term Memory
CREATE TABLE "UserMemory" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "traits" JSONB,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserMemory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserMemory_userId_key" UNIQUE ("userId"),
  CONSTRAINT "UserMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tier 3: Knowledge Graph - Concept Nodes
CREATE TABLE "ConceptNode" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "category" TEXT,
  CONSTRAINT "ConceptNode_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ConceptNode_name_key" UNIQUE ("name")
);

-- Tier 3: Knowledge Graph - Concept Relations
CREATE TABLE "ConceptRelation" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "fromId" TEXT NOT NULL,
  "toId" TEXT NOT NULL,
  "relation" TEXT NOT NULL,
  CONSTRAINT "ConceptRelation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ConceptRelation_fromId_toId_relation_key" UNIQUE ("fromId", "toId", "relation"),
  CONSTRAINT "ConceptRelation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "ConceptNode"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ConceptRelation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "ConceptNode"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ConceptRelation_fromId_idx" ON "ConceptRelation"("fromId");
CREATE INDEX "ConceptRelation_toId_idx" ON "ConceptRelation"("toId");

-- Tier 3: Knowledge Graph - Bridge table (DocumentChunk <-> ConceptNode)
CREATE TABLE "DocumentChunkConcept" (
  "chunkId" TEXT NOT NULL,
  "conceptId" TEXT NOT NULL,
  CONSTRAINT "DocumentChunkConcept_pkey" PRIMARY KEY ("chunkId", "conceptId"),
  CONSTRAINT "DocumentChunkConcept_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "DocumentChunk"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "DocumentChunkConcept_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "ConceptNode"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "DocumentChunkConcept_conceptId_idx" ON "DocumentChunkConcept"("conceptId");
