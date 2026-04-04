# Course Catalog & Content Module Documentation

## Overview
The **Course Catalog & Content** domain is the backbone of the LearnHub platform's Learning Management System (LMS). It handles everything from public course discovery and media storage to complex multi-format lesson delivery.

This domain consists of several interconnected NestJS modules located in `server/src/modules`:
- `CourseModule`
- `MediaModule`
- `ChapterModule`
- `LessonModule`
- `CategoryModule`
- `ArticleModule`
- `BlogModule`

---

## 1. Course Module (`/course`)
The Course module acts as the central hub. It binds users (through Orders) to content (Lessons and Chapters).

### Key Features
- **N+1 Query Prevention:** `getMyCourses` and `findPublishedWithFilters` utilize Prisma `groupBy` batches to fetch aggregated statistics (reviews, total lessons, duration, parsed completion) in parallel, mapping them in O(1) time complexity to maintain blazing fast API response times even when retrieving 100+ courses.
- **Dynamic Content Access:** Differentiates free and paid courses. Free courses simulate a zero-dollar Order checkout (`enrollFreeCourse`), creating a unified, seamless logic layer for validation across the codebase without requiring hacky conditional bypass logic.
- **Push Notifications:** Deeply integrated with `@nestjs/websockets` to trigger global `notifyNewCourse` events whenever an instructor publishes a new course.

---

## 2. Media Module (`/media`)
Handles vast amounts of assets, from PDF attachments to HD Video content, maximizing scalability.

### Key Features
- **Serverless Direct Uploads (Presigned URLs):** Generates time-limited, encrypted Presigned URLs. Clients upload Gigabytes of data directly to AWS S3 / Cloudflare R2, effectively bypassing backend bandwidth bottlenecks and conserving Node.js memory.
- **Asynchronous Processing Ready:** Contains endpoints like `markVideoProcessed` strictly designed for cloud-native webhooks (e.g., AWS Lambda invoking HLS `.m3u8` video chunking), paving the way for encrypted, anti-download video streaming.

---

## 3. Lesson & Chapter Modules (`/lesson`, `/chapter`)
Delivers polymorphic educational content tightly structured into chapters.

### Key Features
- **Poly-Structured Lessons:** A lesson can be cast securely as a Video `LessonType.VIDEO`, Article `LessonType.ARTICLE`, or Quiz `LessonType.QUIZ`. The `LessonService` intelligently routes the payload depending on the selected ENUM to maintain type safety.
- **Bulletproof Quiz Transactions:** Creating a Quiz involves writing to `Lesson`, `LessonQuiz`, `QuizQuestion`, and `QuizOption`. This is strictly guarded inside `prismaService.$transaction`. If any option fails validation, the entire chunk rolls back instantly to prevent corrupted 'phantom' quizzes.

---

## Summary of Optimizations
- ✅ **Batched Aggregate Queries:** Eradicates the looping `count()` N+1 vulnerabilities across the repository.
- ✅ **Presigned Cloud Storage:** Unloads payload stress from the API.
- ✅ **Database Atomicity:** Relies on `$transaction` constructs to protect complex tree insertions.
