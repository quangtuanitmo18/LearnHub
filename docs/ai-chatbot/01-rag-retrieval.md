# RAG & Retrieval System (Hybrid Search)

The RAG (Retrieval-Augmented Generation) system in this project does not rely on passive vector searches alone. It employs three advanced RAG technologies: **HyDE**, **Vector Search**, and **RRF**.

## 1. Theory

### 1.1 HyDE (Hypothetical Document Embeddings)

- **The Problem:** User queries are often extremely short (e.g., "What is React?"). The vector generated from this short query is vocabulary-poor, making finding dense, explanatory paragraphs in the database difficult.
- **The HyDE Solution:** Use an LLM to write a 3-4 sentence "hypothetical answer/explanation" on behalf of the user, then use that long answer to generate the search Vector.
- **Implementation:** `retrieval.service.ts` invokes gemini-2.5-flash during the `expandQuery` step.

### 1.2 Hybrid Search

Instead of relying solely on Vector search, the system combines two retrieval methods:

1. **Full-Text Search (Exact Keyword Match):** Utilizes Postgres `tsvector` + `tsquery` (with a GIN Index). Advantage: It never misses exact IDs or rare technical keywords.
2. **Vector/Semantic Search:** Utilizes the `jina-embeddings-v4` model to create 1024-dimensional coordinates and searches using the `<=>` (Cosine Distance) function of `pgvector`.

### 1.3 RRF (Reciprocal Rank Fusion)

These two vastly different search systems are merged using RRF:

- Formula: `1 / (Rank_Text + 60) + 1 / (Rank_Vector + 60)`
- RRF automatically prioritizes documents that score highly in _both_ algorithms.

## 2. Project Implementation

- Database Schema: `DocumentChunk` (`embedding`, `searchVector`).
- Module Directory: `server/src/modules/chat/retrieval.service.ts`.
- Environment Dependences: Requires `JINA_API_KEY` (for embeddings) and the Postgres `pgvector` extension.
- **LangGraph Integration:** Executed entirely within the `retrieve` node of the graph flow.

---

👉 **Up next:** See `02-knowledge-graph.md` to understand Postgres-native semantic networks.
