# LearnHub

## 🚀 Project Overview

**LearnHub** is a modern, full-stack e-learning web application divided into two main components:
- **Client (Frontend)**: Built with Next.js 15 (App Router) and React 19.
- **Server (Backend)**: Built with NestJS 11.

---

## 💻 Tech Stack

### Client (`/client`)
- **Core Framework**: Next.js 15.4.10 (React 19.1, Turbopack).
- **Styling**: Tailwind CSS v4, Radix UI (headless components), Lucide React & React Icons.
- **State Management & Data Fetching**: Zustand, TanStack React Query.
- **Form & Validation**: React Hook Form, Yup.
- **Rich Text Editor**: Tiptap (with support for code blocks, highlights, mentions, tables, and resizable images).
- **Media & File**: Uploadthing (file uploads), Vidstack (video/audio player), Swiper (carousels).
- **Authentication**: NextAuth.js.
- **Payments**: Stripe (@stripe/stripe-js).
- **Charts & Analytics**: Recharts.
- **Guided Tour**: Driver.js (interactive product walkthrough).
- **Real-Time**: Socket.io-client (notifications, live updates).
- **Other**: Dnd-kit (drag-and-drop), Day.js (date formatting).

### Server (`/server`)
- **Core Framework**: NestJS 11 (Node.js).
- **Database & ORM**: PostgreSQL, Prisma ORM.
- **Authentication**: JWT (Passport.js), bcrypt (password hashing).
- **File Storage**: AWS S3 SDK (Yandex Cloud S3-compatible storage).
- **Task Queue**: BullMQ (background job processing for video transcoding, emails).
- **AI Chatbot**: OpenAI SDK (via OpenRouter for LLM-powered course assistant).
- **Payments**: Stripe (checkout sessions, webhooks).
- **Email**: Nodemailer (transactional emails, order confirmations).
- **Real-Time**: Socket.io & @nestjs/websockets (notifications gateway).
- **Infrastructure**: Docker & Docker Compose (for PostgreSQL).

---

## 📂 Project Structure

```text
LearnHub/
├── client/                 # Next.js Frontend Application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Next.js App Router (pages/layouts)
│   │   ├── components/     # UI components (Radix, shared components)
│   │   ├── configs/        # Route and app configuration
│   │   ├── constants/      # App-wide constants
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Library configurations (axios, api-service)
│   │   ├── services/       # API services
│   │   ├── stores/         # Zustand global state
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Helper functions
│   ├── package.json
│   └── ...
└── server/                 # NestJS Backend Application
    ├── prisma/             # Prisma schema & migrations
    ├── src/
    │   ├── modules/        # Domain modules (controllers, services)
    │   │   ├── auth/       # Authentication (JWT, login, register)
    │   │   ├── course/     # Course CRUD & publishing
    │   │   ├── chapter/    # Chapter management
    │   │   ├── lesson/     # Lesson management
    │   │   ├── article/    # Lesson article content
    │   │   ├── quiz-*/     # Quiz questions & attempts
    │   │   ├── media/      # Media upload & HLS transcoding
    │   │   ├── blog/       # Blog posts
    │   │   ├── comment/    # Lesson comments & replies
    │   │   ├── review/     # Course reviews & ratings
    │   │   ├── order/      # Order management
    │   │   ├── payment/    # Stripe payment integration
    │   │   ├── cart/       # Shopping cart
    │   │   ├── coupon/     # Discount coupons
    │   │   ├── chat/       # AI chatbot (OpenRouter)
    │   │   ├── notification/ # Real-time notifications
    │   │   ├── email/      # Email service (Nodemailer)
    │   │   ├── search/     # Full-text search
    │   │   ├── stats/      # Dashboard analytics
    │   │   ├── user/       # User management
    │   │   ├── role/       # Role & permissions
    │   │   ├── category/   # Course categories
    │   │   └── instructor/ # Instructor profiles
    │   ├── shared/         # Shared logic (decorators, filters, guards, DTOs)
    │   └── main.ts         # Server entry point
    ├── docker-compose.yml  # Docker compose file for PostgreSQL
    ├── package.json
    └── ...
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended).
- [PostgreSQL](https://www.postgresql.org/) or [Docker](https://www.docker.com/) (to run the database via Compose).

### Step 1: Backend Setup (Server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the database using Docker (optional if you have a local instance):
   ```bash
   docker-compose up -d
   ```
4. Environment Setup: Create a `.env` file (based on `.env.example` if available) with your database connection string (`DATABASE_URL`), `JWT_SECRET`, S3 credentials, Stripe keys, and OpenRouter API key.
5. Run Prisma Migrations and Generate Client:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
6. Seed the database (optional):
   ```bash
   npx prisma db seed
   ```
7. Start the development server:
   ```bash
   npm run start:dev
   ```
   > The backend normally runs on port `4000` (or the port configured in your environment variables).

### Step 2: Frontend Setup (Client)

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Environment Setup: Create a `.env` file containing the URLs for your backend API (`NEXT_PUBLIC_API_URL`, etc).
4. Start the development server:
   ```bash
   npm run dev
   ```
   > The frontend uses Turbopack and runs on `http://localhost:3000/`.

---

## ✨ Features

- **📚 Course Management**: Create, publish, and organize courses with chapters, lessons (video/article/quiz), and drag-and-drop ordering.
- **🎥 Video Streaming**: HLS video transcoding via BullMQ background jobs, served through Vidstack player.
- **📝 Rich Text Editor**: Tiptap-based article editor with code blocks, images, tables, and mentions.
- **🧠 Quiz System**: Multiple question types, timed attempts, auto-grading, detailed result review.
- **🤖 AI Chatbot**: LLM-powered course assistant (OpenRouter/OpenAI SDK) for student help.
- **🗺️ Guided Tour**: Interactive onboarding walkthrough using Driver.js.
- **💳 Payments**: Stripe checkout integration with order tracking, invoices, and coupon support.
- **🔔 Real-Time Notifications**: WebSocket-based notifications via Socket.io.
- **💬 Q&A Comments**: Nested comment system with reactions for lesson discussions.
- **⭐ Reviews & Ratings**: Course review system with star ratings, filtering, and statistics.
- **📊 Admin Dashboard**: Comprehensive analytics dashboard with Recharts for revenue, enrollment, and user metrics.
- **🔍 Search**: Full-text course search with category filtering.
- **👥 Role-Based Access**: Admin, Instructor, and Student roles with permission-based routing.
- **📧 Email Notifications**: Transactional emails for order confirmations and account events.
- **📱 Responsive Design**: Fully responsive UI optimized for all screen sizes.
