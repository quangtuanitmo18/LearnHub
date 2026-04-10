# LearnHub Search Architecture

LearnHub utilizes a **Dual Search** architecture to elegantly handle two completely different needs on the platform: User Experience (UX) for web interactions and Deep Semantic Search for the AI Assistant (AI Mentor).

All search capabilities are powered directly by **PostgreSQL**, eliminating the need for third-party search engines (like Elasticsearch) to conserve computational resources and simplify the infrastructure.

---

## 1. Tier 1: Global Site Search

Designed for the **Search Bar** located in the homepage Header, where learners frequently type quick, short phrases (e.g., "react", "js", "web", "design") to search for **Courses** or **Blogs**.

### Problems Solved:
- **Typo-tolerance:** Catches user inputs with accidentally missed or wrong keys (`javascript` -> `javascrpt`).
- **Accent-insensitivity:** Strips out complex accents, diacritics, or foreign characters to broaden search capabilities.
- **Substring matching:** Provides instant results even when a user has only typed half a word (`devel...`).

### Technologies Used: `pg_trgm` (Fuzzy Search) + `unaccent`
In the `SearchService` (Backend), the system utilizes:
1. `unaccent` Extension: Wraps both the target database fields (title, description) and the input query to normalize all diacritics to their base alphabetical characters.
2. `pg_trgm` Extension: Splits the requested query into 3-character chunks (Trigrams). It then compares these Trigrams using the `similarity()` function to find the highest similarity probabilities.
3. Index: `GIN (f_unaccent(title) gin_trgm_ops)` ensuring response times stay under `20-50ms` even traversing millions of records.

**👉 Ultimate Advantage:** It catches typographical errors flawlessly without relying on structural grammar context, safely protecting course sales conversion rates.

---

## 2. Tier 2: RAG Deep Search (AI Semantic Search)

Designed for the underlying **AI Worker / Langchain Mentor**. When a learner asks the chatbot: *"How do I implement user context in React?"*, the AI must traverse tens of thousands of pages of *Video Transcripts* and *Course Documents* (stored as `DocumentChunk`) to answer correctly.

### Problems Solved:
- **Linguistics:** Requires a smart system that understands that *"implement"*, *"implementing"*, and *"implementation"* share the exact same linguistic root.
- **Semantics:** Needs to fetch the correct documents through NLP associations.
- Minor typos are ignored (since modern LLMs like OpenAI can auto-correct spelling before formulating the RAG query).

### Technologies Used: Full-Text Search (`tsvector`) + Vector Search (`pgvector`)
At the `DocumentChunk` storage layer (via Prisma):
1. `searchVector tsvector` Column: PostgreSQL uses its native English Full-Text Search (English Dictionary) to dissect texts, discard `stop words` (like: a, the, in, on), and perform stemming (reducing vocabulary to base `lexemes`).
2. Vector Index (`hnsw`): Supplements the Semantics NLP (Natural Language Processing Embeddings) for cosine similarity checks.
3. Index: `GIN ("searchVector")` scanning entire curriculums within milliseconds.

**👉 Ultimate Advantage:** It analyzes context like a linguistic brain, serving Langchain/OpenAI's RAG standards perfectly.

---

## Conclusion

Rather than bundling everything into a single search engine (which usually results in either terrible UX for web searchers or stupid contexts for AI Chatbots), this **Dual-Engine FTS / Fuzzy** architecture optimizes Database performance strictly according to the golden rule: Allocating the exact right tool to the function it excels at.
