# Community & Interaction Module Documentation

## Overview
The **Community & Interaction** domain drives user engagement, feedback loops, and intelligent automated customer service. 

This domain consists of three modules located in `server/src/modules`:
- `ReviewModule`
- `CommentModule`
- `ChatModule` (AI Bot Engine)

---

## 1. AI Chatbot Engine (Intent Routing & RAG)
The `ChatModule` implements a sophisticated, multi-stage "Supervisor-Worker" AI architecture powered by OpenRouter (which by default utilizes `google/gemini-2.5-flash`).

### Architecture: Supervisor-Worker Flow
1. **Supervisor (`IntentService`)**: Every incoming message is intercepted and pushed through a minimal, fast "classification prompt". This prompt does one thing: it classifies the user's string into an Enum `Intent` (`COURSE_ADVICE`, `ORDER_STATUS`, `SMALL_TALK`, `OUT_OF_SCOPE`).
2. **Worker (`ChatService`)**: Operating as an Intent-driven specialized worker, the `ChatService` dynamically constructs the RAG (Retrieval-Augmented Generation) Context based on the recognized intent.
   - If `COURSE_ADVICE`: Queries `CourseRepository` for course pricing, tags, levels, and injects it into the LLM context.
   - If `ORDER_STATUS`: Queries `OrderRepository` to retrieve the student's latest invoice/order logs, enabling the Chatbot to serve as an authentic Customer Support agent.
3. **Structured JSON Output**: Instead of returning plain text, the LLM is forced to return strict JSON containing `answer`, `suggestions` (clickable Prompts on the front-end), and `courseIds`. The backend parses these IDs and aggressively maps them to actual rich Course Objects to be pushed dynamically to the UI.

---

## 2. Global Feedback & Comments
The `CommentModule` and `ReviewModule` manage human-to-human interaction within the platform.

### Comment Tiers & Reactions
- Supports deeply nested threads (Parent/Child relations).
- Dynamically aggregates **Reactions** (Likes/Dislikes) bound directly to the user's account utilizing efficient repository maps.
- Public views are guarded heavily by an `APPROVED` status check, providing administrative moderation over community discussion.

### Course Review Guardrails
Fake reviews are intrinsically blocked by the system's architecture. The `ReviewService` invokes `hasUserCourseAccess` via the `OrderRepository`. If a user attempts to leave a 5-star or 1-star rating on a course they did not explicitly purchase (or don't legally own via Membership), the server actively bounces the request with a `403 ForbiddenException`.
