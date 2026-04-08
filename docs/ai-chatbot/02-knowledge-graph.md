# Vector Knowledge Graph PostgreSQL

This project implements **GraphRAG** (Knowledge Graph) natively on a PostgreSQL relational database instead of relying on explicit graph infrastructure like Neo4j.

## 1. Knowledge Graph Theory

**The Problem:** Traditional RAG only returns "explicit" flat documents. If a user asks "What do I need to learn before learning NestJS?", standard RAG struggles to capture dependencies and prerequisites.
**The Solution:** A Semantic Graph Network mapping concepts via Nodes and Edges. Example: `Node(NestJS)` -[REQUIRES]-> `Node(Express)`.

## 2. Implementation: DB Schema and Entity Extraction

We use an AI Worker (via BullMQ) to perform background analysis whenever new lessons are added to the system.

### 2.1 Prisma Schema (`schema.prisma`):

- `ConceptNode`: Stores major concepts (name: "React Hooks").
- `ConceptRelation`: Stores the relationship (fromId, toId, relation: "is_a", "requires").
- `DocumentChunkConcept`: Connects the student's lesson document (`chunk`) to the `ConceptNode`.

### 2.2 The Extraction Process (Background Job)

- **File:** `server/src/modules/ai-worker/processors/concept.processor.ts` (Ai Worker Job).
- **Flow:** When a new `chunk` is inserted into the DB -> A message is dispatched to the `ai-concept` Queue -> An LLM reads the file, extracts concepts as structured JSON -> Saves it natively to the Graph DB structure.

### 2.3 Deep Traversal Querying (Recursive CTE SQL)

In `knowledge-graph.service.ts`, instead of a normal query, we utilize Prisma nested includes (or recursive CTE approaches) to fetch the network:

- Automatically fetches Depth-2 concepts (2 nodes deep into the graph).
- Appends relationship strings like `[React] --requires--> [Javascript]` to the LLM Context before answering the student, granting the LLM "Logical deduction" capabilities.

---

👉 **Up next:** See `03-tool-calling.md` to understand how the AI executes website functionalities.
