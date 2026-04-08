# Redis and Queue Runtime in LearnHub

This document explains what Redis is used for in LearnHub, which BullMQ queues exist, and exactly when each job runs.

## 1. Current Redis Responsibilities

Redis is currently used for:

1. BullMQ queue backend (job storage, delayed jobs, retries, locking).
2. Chat short-term history store (`chat_session:{userId}` key) via `ChatStore` with TTL 2 hours.

Redis is not currently used for:

1. HTTP response caching.
2. Socket.IO adapter clustering.

## 2. Runtime Topology (After Worker Split)

Queue execution is intentionally split into two processes:

1. API process (`server/src/main.ts`)
- Handles HTTP requests.
- Enqueues jobs only.
- Does not execute BullMQ processors.

2. Worker process (`server/src/worker.ts`)
- Starts `WorkerAppModule`.
- Executes all BullMQ processors (`@Processor(...)` classes).

Important behavior:

1. If API is up but worker is down, jobs are still enqueued and stored in Redis, but they will not run until worker is up again.
2. Delayed jobs (e.g. 10 minutes, 24 hours) are triggered by Redis/BullMQ timing, then picked up by worker.

## 3. Queue Catalog

| Queue | Job Name | Enqueued By | Runs When | Delay / Retry | Processor |
|---|---|---|---|---|---|
| `auth-queue` | `cleanup-unverified-users` | `AuthQueueService.queueUnverifiedUserCleanup` | User registered/re-registered but not verified yet | Delay 10 minutes, `removeOnComplete: true`, `removeOnFail: false` | `AuthProcessor` |
| `email-queue` | `send-otp-verification` | `EmailQueueService.queueOtpVerificationEmail` | Register / resend OTP flows | Attempts 3, exponential backoff 5s | `EmailProcessor` |
| `email-queue` | `send-password-reset` | `EmailQueueService.queuePasswordResetEmail` | Forgot password flow | Attempts 3, exponential backoff 5s | `EmailProcessor` |
| `email-queue` | `send-order-confirmation` | `EmailQueueService.queueOrderConfirmationEmail` | New order/membership order created | Attempts 3, exponential backoff 5s | `EmailProcessor` |
| `email-queue` | `send-payment-success` | `EmailQueueService.queuePaymentSuccessEmail` | Course payment completed (SePay/Stripe) | Attempts 3, exponential backoff 5s | `EmailProcessor` |
| `email-queue` | `send-membership-activated` | `EmailQueueService.queueMembershipActivatedEmail` | Membership payment completed (SePay/Stripe) | Attempts 3, exponential backoff 5s | `EmailProcessor` |
| `order-queue` | `cancel-unpaid-order` | `OrderQueueService.scheduleCancelOrder` | Order/membership order created with `PENDING` | Delay 24 hours, attempts 3, exponential backoff 5s | `OrderProcessor` |
| `ai-embed` | `document.embed` | `EmbedService.enqueueContent` | Lesson article content created/updated and embedding dispatch called | Attempts 3, exponential backoff 2s, `removeOnComplete: 100`, `removeOnFail: 50` | `EmbedProcessor` |
| `ai-concept` | `concept.extract` | `EmbedProcessor` (after embedding success) | `document.embed` completed and chunk is valid | Attempts 2, exponential backoff 3s, `removeOnComplete: 50`, `removeOnFail: 20` | `ConceptProcessor` |

## 4. Detailed Queue Flows

### 4.1 Auth Queue (`auth-queue`)

Purpose:

1. Cleanup accounts that never complete OTP verification.

Flow:

1. Register/re-register user.
2. API enqueues `cleanup-unverified-users` with 10-minute delay (`jobId: cleanup-{userId}`).
3. If user verifies OTP in time, API removes scheduled cleanup job.
4. If not verified when delay expires, worker checks DB and deletes inactive unverified account.

### 4.2 Order Queue (`order-queue`)

Purpose:

1. Auto-cancel unpaid orders.

Flow:

1. New order created in `PENDING`.
2. API enqueues `cancel-unpaid-order` with 24-hour delay (`jobId: cancel-order-{orderId}`).
3. If payment succeeds before timeout, API removes scheduled cancellation job.
4. If still `PENDING` when job runs, worker updates status to `CANCELLED`.

### 4.3 Email Queue (`email-queue`)

Purpose:

1. Keep API responses fast by offloading SMTP + template/PDF work.

Flow:

1. API enqueues email job immediately.
2. Worker processes email job in background.
3. For payment jobs, worker may generate invoice PDF before sending email.

### 4.4 AI Ingestion Queues (`ai-embed`, `ai-concept`)

Purpose:

1. Build/update RAG data and knowledge graph asynchronously.

Flow:

1. Lesson article content is created/updated.
2. API dispatches embedding jobs by chunk (`document.embed`).
3. Worker generates embeddings and stores `DocumentChunk`.
4. Worker enqueues concept extraction (`concept.extract`).
5. Worker extracts concepts/relations and stores graph links.

## 5. How to Run Locally

From repository root:

```bash
npm run dev
```

This starts:

1. Next.js client.
2. Nest API.
3. BullMQ worker.

Manual split run:

```bash
# terminal 1
npm run dev --prefix client

# terminal 2
npm run start:dev --prefix server

# terminal 3
npm run start:worker:dev --prefix server
```

## 6. Production Run Mode

Deploy API and worker as separate services:

1. API service command:

```bash
npm run start:prod --prefix server
```

2. Worker service command:

```bash
npm run start:worker:prod --prefix server
```

## 7. Operational Notes

1. `ERR max number of clients reached` means Redis client limit is exceeded (usually too many API/worker instances or stale connections).
2. Scaling workers increases throughput but also increases Redis connections.
3. Prefer scaling worker replicas gradually and monitor Redis client count.
