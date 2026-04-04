# E-Learning Engine Module Documentation

## Overview
The **E-Learning Engine** sits at the absolute core of the student experience, handling lesson tracking, interactive quiz validation, and attempt lifecycle management.

This domain consists of three modules located in `server/src/modules`:
- `UserLessonProgressModule`
- `QuizAttemptModule`
- `QuizQuestionModule`

---

## 1. User Lesson Progress
The `UserLessonProgressModule` orchestrates tracking user watch time and lesson completion status. 

### Key Features
- **Centralized Access Guards**: When marking a lesson as complete (`toggleProgress`), the module validates ownership not via local junction tables, but by polling the Single Source of Truth (`Order.status = COMPLETED` or Membership Validity). 
- **O(1) Rendering via Aggregation**: Works seamlessly with `CourseService` which clusters counting tasks into a single Prisma `groupBy` to render progress rings without triggering N+1 load vulnerabilities.

---

## 2. Quiz Attempt & Validation Engine
The `QuizAttemptModule` contains some of the most sophisticated logic in the platform, capable of handling robust evaluation workflows under heavy concurrent load.

### Key Architectural Strengths

#### A. Lazy-Expiration (Cron-less Cleanup)
Instead of forcing the server to run aggressive `setInterval` or Cron Jobs to scan the database for expired quizzes (which kills CPU performance), the engine uses **Lazy-Expiration**.
When a user requests a quiz attempt (`getAttemptContent` or `startOrResumeAttempt`), the API checks if `expiresAt < new Date()`. If true, it quietly processes the expiration on-the-fly and drops access down to EXPIRED.

#### B. Anti-Cheat Partial Scoring Logic
The grading algorithm within `submitAttempt` explicitly protects against a classic loophole where users check *every single option* in a multiple-choice question to secure a guarantee of hitting the correct answers.
- `adjustedCorrect = Math.max(correctSelected - wrongSelected, 0)`
- It penalizes wrong selections by mutating them into negative deductions against their correct selections, restricting `earnedScore` to 0 if the user spams checkboxes.

#### C. Idempotent Submissions
Race conditions (like spam-clicking the Submit button 20 times due to network lag) are effortlessly parried. If an attempt is detected as `SUBMITTED`, the engine gracefully returns the cached result without recalculating grades or corrupting the `correctCount`.

---

## 3. Quiz Question Administration
The `QuizQuestionModule` acts as the banking system for educators to build arrays of questions dynamically linked to specific `$transactions` protecting the data integrity inside the `Lesson` schema. This cleanly splits Quiz Authoring from Quiz Attempting into separate Micro-domains. 
