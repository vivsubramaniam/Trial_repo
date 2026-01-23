# Home Task Board Web App - Implementation Plan

## Overview
A web app for your household (2-4 people) to manage daily tasks with a points system, streaks, and milestone rewards.

---

## Use Case Design (Detailed)

### Users & Profiles
- 2-4 household members
- Each person has a **profile with uploaded photo**
- Simple tap-to-select (no passwords, trust-based)

### Task Types

| Type | Who can complete | Limit |
|------|------------------|-------|
| **Shared tasks** | Anyone | Once per day total. First person to complete gets the points. |
| **Assigned tasks** | Only the assigned person | Only they can mark it done. |

### Task Creation
- **Anyone** can create tasks
- Each task has: title, points value, recurrence, optional assignee
- Recurrence options: daily, weekly, specific days (mon/thu), or one-time

### Daily Flow
- Recurring tasks **reset each morning** (come back fresh)
- Missed tasks are **tracked in history** but **don't carry over** (fresh start each day)
- Users can add new tasks anytime

### Points System

**Base points**: Custom per task (you set the value when creating)

**Streak bonus** (resets weekly):
| Day of Week | Bonus Points |
|-------------|--------------|
| Day 1 | +1 |
| Day 2 | +2 |
| Day 3 | +3 |
| Day 4 | +4 |
| Day 5 | +5 |
| Day 6 | +6 |
| Day 7 | +7 |
| Day 8+ | Resets to +1 (new week) |

- Streak = completing at least one task each day
- **Bonus resets each week** (max +7, then back to +1)
- **Streak count continues** (you can have a 30-day streak, but bonus still cycles weekly)
- **Breaking streak resets bonus** back to +1 (and resets streak count)
- **No penalties** - points never decrease

### Milestone Rewards
- Based on **lifetime cumulative points** (never reset)
- **Household configures** their own milestones:
  - Example: 100 pts = ice cream, 500 pts = movie night, 1000 pts = special outing
- Reaching a milestone is **logged** but reward is **handled offline** by family

### Dashboard Shows
- Today's available tasks
- Today's points earned (per person)
- Weekly scoreboard (leaderboard)
- Personal streak count

### Task Completion
- When completing a task, can add **notes/comments** (e.g., "Also cleaned the filter")
- Notes saved with the completion record for history

### History Views
- **Daily view**: Calendar-style, see who did what each day
- **Summary view**: Weekly/monthly totals per person
- See missed tasks (tracked but don't carry over)

---

## Technology Choices

| Component | Choice | Why |
|-----------|--------|-----|
| **Framework** | Next.js 14 | Handles both frontend and API in one place |
| **Database** | SQLite + Prisma | Single file database, easy to backup |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Language** | TypeScript | Type safety and better IDE support |

---

## App Structure

```
home-task-board/
├── src/
│   ├── app/                    # Pages and API routes
│   │   ├── page.tsx            # Dashboard
│   │   ├── tasks/              # Task management
│   │   ├── history/            # View past completions
│   │   ├── leaderboard/        # Points ranking
│   │   ├── milestones/         # Rewards configuration
│   │   ├── profile/            # User profiles
│   │   └── api/                # Backend API endpoints
│   ├── components/             # Reusable UI components
│   └── lib/                    # Utilities and database
├── prisma/
│   └── schema.prisma           # Database schema
├── public/uploads/             # Profile photos
└── package.json
```

---

## Database Tables

- **User**: id, name, photoPath, lifetimePoints, currentStreak, streakBonus, lastActiveDate
- **Task**: id, title, points, recurrence, assignedUserId, createdById, isActive
- **TaskCompletion**: id, taskId, userId, completedAt, basePoints, bonusPoints, notes
- **Milestone**: id, pointsRequired, rewardName, description
- **MilestoneRedemption**: id, milestoneId, userId, reachedAt, redeemedAt

---

## Pages

1. **Dashboard** (`/`) - Today's tasks, quick stats, weekly scoreboard
2. **Tasks** (`/tasks`) - Create, edit, delete tasks
3. **History** (`/history`) - Calendar view of past completions
4. **Leaderboard** (`/leaderboard`) - Weekly and all-time rankings
5. **Milestones** (`/milestones`) - Configure and track rewards
6. **Profile** (`/profile`) - Manage household members

---

## Setup Commands

```bash
# Install dependencies
npm install

# Create database
npm run db:push

# Seed default milestones
npm run db:seed

# Start development server
npm run dev
```

Then open http://localhost:3000 in your browser.
