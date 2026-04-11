# Gamification & Achievements Module

**Module Path:** `server/src/modules/gamification`

## 1. Overview
The **Gamification** module (also known as the Achievement Module) is a core system built to enhance user engagement and learning motivation across the LearnHub platform. This module operates on gamification principles, including Points, Levels, Streaks, Badges/Achievements, and a Real-time Leaderboard.

## 2. Core Features & Functions

### 2.1. Points System
- **Mechanism:** Users receive points when completing specific actions within the system. The current point distribution is automatically added through asynchronous queues (`gamificationQueue`) in the following 7 cases:
  1. **Daily Login:** `+5 points` (Triggered on successful login)
  2. **Review Added:** `+5 points` (Triggered when leaving a review for an enrolled course)
  3. **Lesson Completed:** `+10 points` (Triggered when marking a lesson as finished)
  4. **Quiz Passed:** `+20 points` (Triggered when submitting a quiz and achieving the `passScore`)
  5. **Blog Published:** `+50 points` (Triggered when a user's blog is uploaded/approved)
  6. **Blog Upvoted:** `+5 points` (The blog author receives 5 points for every community upvote)
  7. **Course Completed:** `+50 points` (Triggered when learning progress hits 100% and a certificate is issued)
- **Data Storage:** All point transactions are meticulously recorded in the `PointHistory` table (with `reason` and `metadata` to easily trace back the triggered action).
- **Core Function:** `handleAddPoints(userId, points, reason, metadata)` safely applies points using Prisma database transactions to guarantee data integrity.

### 2.2. Leveling System
- **Mechanism:** A user's level is dynamically calculated based on their Total Points. Levels are not hardcoded in the database but evaluated on-the-fly.
- **Formula:** `Level = floor(sqrt(totalPoints / 50)) + 1`
  - *Example thresholds:* L1 = 0 pts, L2 = 50 pts, L3 = 200 pts, L4 = 450 pts...
- The system returns detailed progress metrics (points remaining to reach the next level, percentage of completion).

### 2.3. Streak System
- **Mechanism:** Encourages users to maintain a daily learning and login habit.
- **Calculation Logic:**
  - If the user returns between **24 to 48 hours** from their last activity: the `currentStreak` increments by 1 (and updates `longestStreak` if it's a new personal record).
  - If the user returns **after 48 hours**: the `currentStreak` is reset to 1.

### 2.4. Badges & Achievements
- When users gain points or extend their streaks, the system automatically evaluates their condition (`BadgeCondition`) to mint badges.
- **Badge Conditions (`BadgeCondition`):** 
  1. `POINTS_REACHED`: Achieving a specific lifetime points milestone.
  2. `STREAK_REACHED`: Reaching a certain number of continuous active days.
- **Real-time Notifications:** Upon unlocking a new badge, the system pushes a live notification to the client via `NotificationService` to celebrate the achievement (e.g., `"New Badge! 🎖️"`).

### 2.5. Real-time Leaderboard
- **Infrastructure:** Integrated directly with **Redis** using Sorted Sets (`ZSet`) through `zadd`, `zrevrange`, and `zrevrank` operations.
- **Mechanism:** Facilitates lightning-fast updates and queries for the global all-time leaderboard. Any points addition instantly updates the user's score in the Redis `leaderboard_all_time` node, ensuring extreme scale resilience with near-zero latency.

---

## 3. APIs Overview

### User APIs
Located at `GamificationController` (`/gamification`)
- `GET /gamification/me`: Returns detailed gamification info of the current user: total points, streak (`currentStreak`, `longestStreak`), Global Rank, Level context, and a list of unlocked Badges.
- `GET /gamification/leaderboard?limit=100`: Fetches the top-ranking users globally, instantly joined with Database data (Username and Avatar) for rendering.

### Admin APIs
Located at `AdminGamificationController` (`/admin/gamification/badges`). Facilitates flexible gamification administration.
- `GET /admin/gamification/badges`: Lists all badge configurations.
- `POST /admin/gamification/badges`: Creates a new badge (Specifies Icon, Name, type of milestone condition).
- `PUT /admin/gamification/badges/:id`: Updates a badge configuration.
- `DELETE /admin/gamification/badges/:id`: Deletes a badge.

---

## 4. Practical Implementation Map
- Behind the scenes, almost all gamification actions (e.g., module interactions, tests) emit events to the BullMQ system where the `gamification.processor.ts` handles the asynchronous distribution overhead.
- Grants system administrators the flexibility to create seasonal/competitive events by creating high-value milestone badges purely through the REST API.
- Drives maximum Daily Active Users (DAU) retention via the Streak and level mechanisms.
