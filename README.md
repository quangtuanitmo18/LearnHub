# LearnHub

## 🚀 Project Overview

**LearnHub** is a modern, full-stack e-learning web application divided into two main components:
- **Client (Frontend)**: Built with Next.js 15 (App Router) and React 19.
- **Server (Backend)**: Built with NestJS 11.

---

## 💻 Tech Stack

### Client (`/client`)
- **Core Framework**: Next.js 15.4.4 (React 19)
- **Styling**: Tailwind CSS v4, Radix UI (headless components), Lucide React (icons).
- **State Management & Data Fetching**: Zustand, TanStack React Query.
- **Form & Validation**: React Hook Form, Yup.
- **Rich Text Editor**: Tiptap (with support for code blocks, highlights, mentions, tables, and images).
- **Media & File**: Uploadthing (file uploads), Vidstack (video/audio player).
- **Authentication**: NextAuth.js.
- **Other Features**: Dnd-kit (drag-and-drop), Stripe (payments), Socket.io-client (real-time communication).

### Server (`/server`)
- **Core Framework**: NestJS 11 (Node.js).
- **Database & ORM**: PostgreSQL, Prisma ORM.
- **Authentication**: JWT, bcrypt (password hashing).
- **Infrastructure**: Docker & Docker Compose (for the database).

---

## 📂 Project Structure

```text
LearnHub/
├── client/                 # Next.js Frontend Application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Next.js App Router (pages/layouts)
│   │   ├── components/     # UI components (Radix, shared components)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Library configurations (e.g., axios)
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
    │   ├── shared/         # Shared logic (decorators, filters, guards)
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
4. Environment Setup: Create a `.env` file (based on `.env.example` if available) with your database connection string (`DATABASE_URL`) and `JWT_SECRET`.
5. Run Prisma Migrations and Generate Client:
   ```bash
   npx prisma generate
   # Run migrations if necessary:
   # npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   npm run start:dev
   ```
   > The backend normally runs on port `3000` (or the port configured in your environment variables).

### Step 2: Frontend Setup (Client)

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   # (Using --legacy-peer-deps is recommended as Next 15/React 19 might have strict peer dependency checks with some packages)
   ```
3. Environment Setup: Create a `.env` file containing the URLs for your backend API (`NEXT_PUBLIC_API_URL`, etc).
4. Start the development server:
   ```bash
   npm run dev
   ```
   > The frontend uses Turbopack and runs on `http://localhost:4000/`.

---

## ✨ Features

Based on the technology stack, LearnHub supports:
- **E-Learning System**: Video playback (`vidstack`), rich-text editing (`tiptap`), and course payments (`stripe`).
- **Real-Time Interaction**: Live updates, notifications, or chat using `socket.io-client`.
- **Drag & Drop**: Sorting and managing course content/lessons with `dnd-kit`.
- **Admin Dashboard**: Comprehensive UI components for admin management using Radix UI.
