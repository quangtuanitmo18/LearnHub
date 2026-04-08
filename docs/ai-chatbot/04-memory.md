# Long-Term Session Memory

The worst downfall of a standard chatbot is "short-term amnesia". Every time the webpage is reloaded, the chatbot forgets who the user is, their learning personality, weaknesses, or specific knowledge gaps.

## 1. Long-Term Memory Theory (Session Summarization)

Instead of saving every single line of chat (which costs thousands of payload tokens if the session gets too long), we utilize a technique known as **Memory Profiling**.

**The Mechanism:**

- After a few lines of conversation with the student, the NestJS Backend instructs an LLM to evaluate the entire chat snippet.
- It extracts the user's "Strengths", "Weaknesses", and "Progress" and overwrites the `summary` column along with the `traits (JSON)` column in the Database.
- The next time the learner opens the chat box, the system pulls this concise Summary Column (just a few dozen words) and injects it statically into the initial System Prompt (`You are talking to this user: {summary}`). As a result, Prompt/Context permanence is preserved even if they switch to a brand new web browser!

## 2. Project Implementation

### 2.1 The Schema (`UserMemory` inside Postgres)

Utilizing the `UserMemory` table:

- 1-to-1 relationship mapped via `userId`.
- Contains a text column (like a teacher's personal diary notebook).
- Contains a JSON column to strictly categorize the Level and Topics the student cares about.

### 2.2 Non-blocking Background Task (Fire-and-forget)

The summarization process takes time (about 1-2 seconds because it requires calling the AI). Therefore, it does NOT block the User's response flow.

- **Inside `chat.service.ts`:** Immediately after returning the text answer to the User, the system executes the command `this.memoryService.saveMemory(...)`.
- **The `saveMemory` function:** Contains a `.catch()` block that runs safely in the background (fire and forget) without bloating the API response Latency.
- Automatically bypasses summarization if the conversation message count is too small, saving API operational costs (utilizing a `length % 4 == 0` modulo condition).

---

**Whole Agentic AI Flow Conclusion:**
The synergistic combination of the **LangGraph Agent Framework**, **HyDE Query Expansion**, **Postgres Recursive CTE Knowledge Graphs**, **RRF Hybrid Distance Search**, **Backend API Tool Calling Integation**, and **Permanent Long-Term Summarized Memory** forms a closed ecosystem that behaves identical to a completely independent Human Instructor 🤖❤️🔥.
