# AI Chatbot Architecture: Overview (Agentic LMS)

The LearnHub project utilizes a **Tier 3 (Agentic LMS)** AI Chatbot architecture built with **LangGraph** and the **Vercel AI SDK**, transforming the chatbot into a proactive "learning assistant" rather than a passive Q&A RAG system.

## 1. Core Theory (LangGraph Workflow)

In an Agentic architecture, the AI flow is not a straight line (Prompt -> LLM -> Text) but a directed Graph with conditional branches.

The project's Graph flow consists of the following nodes:

1. **Classify:** Identifies whether the user is asking about a lesson, course progress, coupon codes, or generic out-of-scope questions.
2. **Expand:** Enhances the user's original query using an LLM for better similarity search.
3. **Retrieve:** Extracts knowledge from the database (PostgreSQL).
4. **Generate:** Sends the context to the AI model (OpenRouter / Gemini) for processing and generating a response.
5. **Tool Execution:** If the AI decides to call a function, it branches to this Node (e.g., calling APIs to fetch progress, validate coupons, etc.).

## 2. Key Implementation Files

- **`ai.controller.ts`**: Receives the initial request from the Frontend via Vercel AI SDK.
- **`chat.service.ts`**: Initializes the LangGraph pipeline and manages `ChatOpenAI`.
- **`intent.service.ts`**: Uses `withStructuredOutput` to classify user intent.
- **`retrieval.service.ts`**: Calls Jina AI to generate vectors, performs RRF search, and hybridizes with Full-text search.
- **`knowledge-graph.service.ts`**: Extracts and traverses the graph relationships between keywords.
- **`memory.service.ts`**: Remembers user traits and progress across multiple sessions.
- **`tools.service.ts`**: Declares the tools (functions) that allow the LLM to trigger internal NestJS repository methods.

---

👉 **Up next:** See `01-rag-retrieval.md` to understand the RAG Hybrid Search functionality.
