# Supabase & Connection Pooling (PgBouncer/Supavisor) Setup Guide

This document explains how the **LearnHub** project establishes connections to the Supabase PostgreSQL database via Prisma, specifically utilizing Connection Pooling to optimize performance and prevent connection limit exhaustion.

---

## 1. Why Use Connection Pooling?
When a backend application (like NestJS) scales or is deployed on Serverless architectures, it continuously opens and closes numerous database connections. 
PostgreSQL itself has a strict limit on the number of concurrently active direct connections (typically around 60 - 100 on free or lower tiers).

To solve this problem, Supabase provides a **Connection Pooler** (Supavisor / PgBouncer). The pooler sits between the application and the database, allowing the application to open thousands of connections while consuming only a minimal number of actual physical connections to the database.

---

## 2. Prisma Configuration Design (`schema.prisma`)
In the `server/prisma/schema.prisma` file, the project is configured with two distinct connection flows:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

- **`url`**: The connection string used for executing application queries at runtime. -> Routes through the Pooler.
- **`directUrl`**: The direct connection string. -> Dedicated exclusively for executing migrations to alter the database schema or pushing changes.

---

## 3. Environment Variables (`server/.env`)
### A. `DATABASE_URL` (Port 6543)
This is the Transaction Pooler connection string.
- **Purpose**: Used by NestJS/Prisma for all standard CRUD (Create, Read, Update, Delete) operations.
- **Port**: `6543` 
- **Required Prisma Flag**: Must append `?pgbouncer=true` to the end of the connection string.
- **Standard Supavisor Example**:
  ```env
  DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
  ```
*(You can find the exact URL in the Supabase Dashboard > Settings > Database > Connection String > Enable Connection Pooling).*

### B. `DIRECT_URL` (Port 5432)
This is the Direct connection string (Session Mode).
- **Purpose**: **STRICTLY RESERVED** for the `npx prisma migrate dev` or `npx prisma db push` commands. Schema manipulation operations must bypass PgBouncer's transaction mode since it hinders administrative table locks; they require a direct path to the database.
- **Port**: `5432`
- **Example**:
  ```env
  DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
  // or (legacy direct IPv4 connection)
  DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
  ```

---

## 4. Special Characters & URL Encoding (Password)
This is the most common reason the Prisma Engine fails to connect.
Passwords provided by Supabase (or set by you) sometimes contain special characters such as `@`, `#`, `?`, or `/`. When inserted into a connection URL, Prisma misinterprets these reserved URI delimiters.

**You MUST URL-encode your password:**
- The `@` symbol becomes `%40`
- The `#` symbol becomes `%23`
- The `?` symbol becomes `%3F`

**Example:**
- Your Password: `learnhub123@`
- Incorrect: `postgresql://postgres:learnhub123@@aws...` (Throws an error due to the double `@`)
- **Correct**: `postgresql://postgres:learnhub123%40@aws...`

---

## 5. Deployment Checklist Summary
1. Ensure `DATABASE_URL` points to the `pooler.supabase.com` domain, utilizes port `6543`, and includes the `?pgbouncer=true` query parameter.
2. Ensure `DIRECT_URL` connects via port `5432`.
3. Double-check that all special characters in the database password are correctly URL-encoded (`%` syntax).
4. Configure SSL connections if using Managed Cloud Redis instances in the NestJS application (`REDIS_TLS=true`).
