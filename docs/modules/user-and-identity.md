# User & Identity Module Documentation

## Overview
The **User & Identity** domain is a core architectural pillar of the LearnHub platform. It is responsible for handling authentication, authorization, user profiles, role-based access control (RBAC), and instructor-specific functionalities.

This domain is divided into four distinct NestJS modules located in `server/src/modules`:
- `AuthModule`
- `UserModule`
- `RoleModule`
- `InstructorModule`

---

## 1. Auth Module (`/auth`)
The Auth module provides a highly secure, enterprise-grade authentication system utilizing JWT (JSON Web Tokens) and bcrypt password hashing.

### Key Features
- **Dual-Token System:** Implements separation of concerns with short-lived Access Tokens (1 day) and long-lived Refresh Tokens (7 days) to minimize security risks.
- **Social Login:** Supports OAuth2 integration with Google and Facebook, securely handling payload verification and automatic avatar synchronization.
- **OTP Email Verification:** Asynchronous Queue-based OTP generation and email dispatch (using BullMQ) to avoid blocking the main server thread. Verified accounts enjoy automated cleanup of unused OTPs.
- **Secure Password Reset:** Reset tokens are mapped securely. Before being saved to PostgreSQL, raw tokens are encrypted using `crypto.createHash('sha256')`. The user only receives the raw token via Email, ensuring high protection against Database Dumps.
- **Rate Limiting (Throttler):** API endpoints are strictly protected against Brute-force and DDoS attacks:
  - Global Default: 50 requests / minute
  - Login: 10 requests / minute
  - OTP & Resend: 3-5 requests / minute

---

## 2. User Module (`/user`)
The User module serves as the primary data management layer for learner profiles and administrative control over accounts.

### Key Features
- **Repository Pattern:** The `UserService` extends a generic `BaseService` abstraction via `UserRepository`. This completely decouples complex Prisma Client queries from business logic.
- **Direct-to-S3 Avatars (Presigned URLs):** User avatars are uploaded natively from the Client directly to AWS S3/Cloudflare R2 via Presigned URLs. This eliminates the Node.js server acting as a memory-heavy image middleware proxy.
- **Transactions ($transaction):** Critical operations like swapping or appending roles to a User are strictly executed within a Prisma Database Transaction to ensure Data Atomicity.
- **Membership Cron:** Ready-to-go architecture that routinely checks and deactivates expired user memberships automatically.

---

## 3. Role Module (`/role`)
A robust Role-Based Access Control (RBAC) mechanism. 

### Key Features
- **Data Integrity Safety:** Enforces safe deletion. You cannot delete a Role if it is actively linked to users (utilizing the `isAssignedToUsers` constraint check), preventing orphan role assignments and database foreign key crashes.
- **Dynamic Permission Mapping:** Roles aggregate permissions which are collected during the `getCurrentUser` authentication phase, delivering real-time permission scopes to the client over JWT.

---

## 4. Instructor Module (`/instructor`)
An isolated module dedicated specifically to serving Instructor profiles and retrieving aggregated data for public interfaces.

### Key Features
- **Data Leak Prevention:** Explicit logic is implemented to omit sensitive fields (e.g., `email`) from public instructor listings.
- **Query Optimization:** Extensive use of Prisma's `_count` aggregation to tally published courses, reviews, and lessons. This avoids fetching large objects into server memory, drastically increasing query times and reducing database CPU strain.
- **Prisma Upsert:** Utilizes the upsert paradigm to intelligently create or update Instructor Profiles seamlessly.

---

## Security Highlights
- ✅ Standardized password hashing (`bcrypt` cost factor 10)
- ✅ HTTP-Only Cookie strategy configuration for Tokens
- ✅ Route-level Throttler Limiters
- ✅ Pre-hashed password reset tokens in database layer
- ✅ Nullification/Decoupling of S3 proxy limits utilizing client-side presigned URLs
