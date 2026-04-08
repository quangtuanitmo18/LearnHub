# Tool Execution (Function Calling & Agentic API)

Function Calling (or Tool Calling) is the biggest difference between a passive "Chatbot" (which only replies with text) and an "Agentic LMS" (a super-assistant that can take action). When a student chats, the Chatbot has the permission and capability to trigger the system's APIs.

## 1. Tool Calling Theory (Tool binding)

Operating Principle:

1. You declare a list of "Tools" tightly typed using Typescript (including Name, Description, and a Zod Parameter Schema).
2. At the start of the LangGraph conversation, the system invokes the `bindTools()` function to bind that list of tools into the LLM context.
3. If the LLM determines that the student's question requires checking the database, it sends back a `tool_calls` payload to the NestJS backend.
4. The backend automatically executes the API command (e.g., scanning a course) -> Pushes the result back into the Graph -> The LLM writes a smooth, natural response containing the data.

## 2. Project Implementation

### 2.1 Graph Binding Point (LangGraph)

- **Node: `toolExecution`**: This node exists in parallel with the `generate` node inside `chat.service.ts`.
- **Flow:** `generate (receives tool_calls)` -> diverges to `toolExecution (runs actual code functions)` -> feeds the Output back to the LangGraph grid -> Updates State -> routes back to conditional `generate` to seal the context.

### 2.2 Configuration File (`server/src/modules/chat/tools.service.ts`)

Declaring 3 Core Tools:

1. `get_learning_progress`: A wrapper for `UserLessonProgressService`. Effect: Answers questions like "How far along am I in this course?". Returns completion percentage and recent lessons.
2. `lookup_coupon`: A wrapper for `CouponService`. Effect: The student asks "Can I still use the code sale12?", the AI checks validity and responds with expiration dates.
3. `get_course_details`: Looks up courses inside the Database. Effect: Matches user keywords to directly recommend accurate courses instead of relying on standard RAG (higher precision vs vector search).

---

👉 **Up next:** See `04-memory.md` to understand the long-term student behavior memory algorithm.
