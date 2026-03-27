# Redis in LearnHub: Architecture & Current Usage

This document outlines the role of Redis within the LearnHub backend architecture and details exactly what tasks it is currently assigned to handle.

## Why Do We Need Redis?
While Node.js is excellent at handling I/O and asynchronous tasks, it lacks robust tools for managing distributed state, long-term async jobs, and task synchronization across multiple server instances. 

We use **BullMQ** as our task queue framework, but BullMQ requires **Redis** to function. Redis acts as the true "storage and memory" layer for BullMQ:

1. **Persistence (Surviving Restarts):** If Node.js restarts or crashes, RAM contents are lost. Redis stores job details (e.g., recipient emails, attachments) in-memory but with persistence, guaranteeing no tasks are lost gracefully.
2. **Delayed Execution (Timers):** For operations requiring delays (like cancelling unpaid orders after 24 hours), Redis features efficient *Sorted Sets* to manage countdowns, which is drastically safer and more scalable than Node.js `setTimeout()`.
3. **Atomic Locking (Scalability):** When horizontally scaling the backend across multiple instances, Redis uses atomic locks to guarantee a job is processed *exactly once*. Without Redis, two servers might pull the same email job and send a duplicate email to a customer.
4. **Pub/Sub (Real-time Communication):** Redis uses Publisher/Subscriber mechanisms to allow producers (the API requests) to quickly hand off tasks to workers (the background processors) seamlessly without blocking the main event loop.

## What is Redis Currently Used For?
Presently, Redis is used **strictly as a Message Broker for BullMQ queues**. It does *not* currently handle API caching, session HTTP storage, or Socket.IO state clustering. 

Redis supports the following three background task queues:

### 1. The Email Queue (`EmailQueue`)
Handles sending automated emails in the background to avoid blocking API responses (e.g., waiting for SMTP server handshakes). It manages 5 specific jobs:
- **`SEND_ORDER_CONFIRMATION`:** Sends an order confirmation email immediately when an order is created.
- **`SEND_PAYMENT_SUCCESS`:** Generates a PDF Invoice and sends an email confirming a successful course purchase.
- **`SEND_MEMBERSHIP_ACTIVATED`:** Generates a PDF Invoice and sends an email welcoming the user to their new membership tier.
- **`SEND_PASSWORD_RESET`:** Delivers password reset instructions and links.
- **`SEND_OTP_VERIFICATION`:** Delivers the verification OTP code during user registration.

### 2. The Order Queue (`OrderQueue`)
Handles time-sensitive logic for order lifecycle management.
- **`CANCEL_UNPAID_ORDER`:** Once a new order is generated in `PENDING` state, this job is scheduled with a **24-hour delay**.
  - If the user fails to pay within 24 hours, the job awakens and updates the order status to `CANCELLED`.
  - If the user pays successfully within 24 hours, the backend proactively deletes this scheduled job from Redis.

### 3. The Auth Queue (`AuthQueue`)
Handles automated maintenance and cleanup of user accounts.
- **`CLEANUP_UNVERIFIED_USERS`:** When a user registers, they are given a short window to verify their email address via OTP. A delayed job is appended to Redis. Once the time lapses, the job checks the database. If the user's `isEmailVerified` flag remains false, the job forcefully deletes the unverified record from the database to clean up junk data.

---

*(Note: If API caching or distributed WebSockets are implemented in the future, Redis will take on those supplementary responsibilities as well.)*
