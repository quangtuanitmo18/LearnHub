A) Prisma models (final)

enum AttemptStatus {
IN_PROGRESS
SUBMITTED
EXPIRED
}

// -------- USER DO QUIZ --------

model QuizAttempt {
id String @id @default(uuid())

lessonId String
quiz LessonQuiz @relation(fields: [lessonId], references: [lessonId], onDelete: Cascade)

userId String
attemptNo Int
status AttemptStatus @default(IN_PROGRESS)

startedAt DateTime @default(now())
expiresAt DateTime?
submittedAt DateTime?

score Float?
maxScore Float?
passed Boolean?
correctCount Int?
totalCount Int?

answers QuizAttemptAnswer[]

@@unique([lessonId, userId, attemptNo])
@@index([lessonId, userId])
@@index([status, expiresAt])
}

model QuizAttemptAnswer {
id String @id @default(uuid())

attemptId String
attempt QuizAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)

questionId String
question QuizQuestion @relation(fields: [questionId], references: [id])

selectedOptionIds String[] @default([])

isCorrect Boolean?
earnedScore Float? // optional, useful for breakdown (all-or-nothing: points or 0)
questionSnapshot Json? // recommended for stable review

@@unique([attemptId, questionId])
@@index([questionId])
}

B) Core Rules (BE logic chuẩn)
Lazy-expire (bắt buộc ở mọi API attempt)
Nếu:
status == IN_PROGRESS

expiresAt != null

now > expiresAt
→ update attempt status = EXPIRED rồi không cho save/submit nữa.

Start/resume policy (khuyến nghị)
Nếu user đã có attempt IN_PROGRESS chưa expired → return attempt đó (resume)

Chỉ tạo attempt mới khi không có IN_PROGRESS hợp lệ

Counting maxAttempts: đếm attempts có status SUBMITTED + EXPIRED

Scoring policy
All-or-nothing:

isCorrect = set(selectedOptionIds) == set(correctOptionIds)

earnedScore = isCorrect ? question.points : 0

Attempt:

score = sum(earnedScore)

maxScore = sum(question.points) tại thời điểm submit (đóng băng)

passed = passScore != null ? (score/maxScore\*100 >= passScore) : null

C) Unified Flow Table (FE ↔ BE)

1. Start (or Resume) Attempt
   Item
   Spec
   Endpoint
   POST /api/quizzes/:lessonId/attempts/start
   FE payload
   {}
   BE does
   find IN_PROGRESS attempt (lazy-expire it) → if valid return; else check maxAttempts → create new attempt
   Response
   attempt meta

Response sample
{
"attemptId": "att_001",
"lessonId": "l3",
"attemptNo": 1,
"status": "IN_PROGRESS",
"startedAt": "2026-01-10T02:00:00.000Z",
"expiresAt": "2026-01-10T02:10:00.000Z"
}

2. Load Attempt + Quiz Content (for doing)
   Item
   Spec
   Endpoint
   GET /api/attempts/:attemptId
   FE payload
   none
   BE does
   load attempt (lazy-expire) + load questions/options (NO isCorrect) + load saved answers
   Response
   questions + savedAnswers + expiresAt

Response sample
{
"attemptId": "att_001",
"lessonId": "l3",
"status": "IN_PROGRESS",
"expiresAt": "2026-01-10T02:10:00.000Z",
"questions": [
{
"id": "q1",
"type": "TRUE_FALSE",
"text": "Prisma là ORM cho Node.js?",
"order": 1,
"points": 1,
"options": [
{ "id": "o1", "text": "True", "order": 1 },
{ "id": "o2", "text": "False", "order": 2 }
]
},
{
"id": "q2",
"type": "MULTIPLE_CHOICE",
"text": "Prisma hỗ trợ gì?",
"order": 2,
"points": 2,
"options": [
{ "id": "o3", "text": "Type-safe queries", "order": 1 },
{ "id": "o4", "text": "Schema migrations", "order": 2 },
{ "id": "o5", "text": "UI framework", "order": 3 }
]
}
],
"savedAnswers": [
{ "questionId": "q1", "selectedOptionIds": ["o1"] }
]
}

3. Autosave Answers (optional but recommended)
   Item
   Spec
   Endpoint
   PUT /api/attempts/:attemptId/answers
   FE payload
   answers array
   BE does
   lazy-expire; if not IN_PROGRESS reject; upsert answers by (attemptId, questionId)
   Response
   { "ok": true }

FE payload sample
{
"answers": [
{ "questionId": "q1", "selectedOptionIds": ["o1"] },
{ "questionId": "q2", "selectedOptionIds": ["o3", "o4"] }
]
}

4. Submit Attempt (grade + finalize)
   Item
   Spec
   Endpoint
   POST /api/attempts/:attemptId/submit
   FE payload
   answers array (send full state)
   BE does
   transaction: lazy-expire; if IN_PROGRESS grade (compare with QuizOption.isCorrect); write snapshots; update attempt status=SUBMITTED + score fields
   Response
   summary result

FE payload sample
{
"answers": [
{ "questionId": "q1", "selectedOptionIds": ["o1"] },
{ "questionId": "q2", "selectedOptionIds": ["o3", "o4"] }
]
}

Response sample
{
"attemptId": "att_001",
"status": "SUBMITTED",
"score": 3,
"maxScore": 3,
"passed": true,
"correctCount": 2,
"totalCount": 2,
"submittedAt": "2026-01-10T02:05:30.000Z"
}

Lưu ý idempotent: nếu attempt đã SUBMITTED thì endpoint submit có thể trả lại result luôn.

5. Get Result (review)
   Item
   Spec
   Endpoint
   GET /api/attempts/:attemptId/result
   FE payload
   none
   BE does
   load attempt + answers; render using questionSnapshot nếu có, hoặc join question/options; trả isCorrect để FE show
   Response
   detailed result

Response sample
{
"attemptId": "att_001",
"lessonId": "l3",
"attemptNo": 1,
"status": "SUBMITTED",
"score": 3,
"maxScore": 3,
"passed": true,
"answers": [
{
"questionId": "q1",
"question": {
"type": "TRUE_FALSE",
"text": "Prisma là ORM cho Node.js?",
"points": 1,
"options": [
{ "id": "o1", "text": "True", "order": 1, "isCorrect": true },
{ "id": "o2", "text": "False", "order": 2, "isCorrect": false }
]
},
"selectedOptionIds": ["o1"],
"isCorrect": true,
"earnedScore": 1
},
{
"questionId": "q2",
"question": {
"type": "MULTIPLE_CHOICE",
"text": "Prisma hỗ trợ gì?",
"points": 2,
"options": [
{ "id": "o3", "text": "Type-safe queries", "order": 1, "isCorrect": true },
{ "id": "o4", "text": "Schema migrations", "order": 2, "isCorrect": true },
{ "id": "o5", "text": "UI framework", "order": 3, "isCorrect": false }
]
},
"selectedOptionIds": ["o3", "o4"],
"isCorrect": true,
"earnedScore": 2
}
]
}

6. List Attempts (history + remaining attempts)
   Item
   Spec
   Endpoint
   GET /api/quizzes/:lessonId/attempts
   Response
   list attempts + maxAttempts + usedAttempts

Response sample
{
"lessonId": "l3",
"maxAttempts": 3,
"usedAttempts": 1,
"attempts": [
{
"attemptId": "att_001",
"attemptNo": 1,
"status": "SUBMITTED",
"score": 3,
"maxScore": 3,
"passed": true,
"submittedAt": "2026-01-10T02:05:30.000Z"
}
]
}

FE flow UI
User click “Start Quiz” → call POST start → get attemptId

Call GET attempt → render questions/options + restore savedAnswers

On choose option:

update local state

debounce call PUT answers

On submit:

call POST submit with current answers

navigate to result view: GET result
