export interface User {
  id: string
  name: string
  photoPath: string | null
  lifetimePoints: number
  spendablePoints: number
  currentStreak: number
  streakBonus: number
  lastActiveDate: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  points: number
  recurrence: string
  deadline: Date | null
  isActive: boolean
  assignedUserId: string | null
  assignedUser?: User | null
  createdById: string
  createdBy?: User
  createdAt: Date
  updatedAt: Date
}

export interface TaskCompletion {
  id: string
  taskId: string
  task?: Task
  userId: string
  user?: User
  completedAt: Date
  basePoints: number
  bonusPoints: number
  notes: string | null
}

export interface Reward {
  id: string
  name: string
  description: string | null
  pointsCost: number
  isActive: boolean
  createdAt: Date
}

export interface RewardRedemption {
  id: string
  rewardId: string
  reward?: Reward
  userId: string
  user?: User
  redeemedAt: Date
  pointsSpent: number
}

export interface DailyStats {
  date: string
  completions: TaskCompletion[]
  pointsByUser: Record<string, number>
  missedTasks: Task[]
}

export interface WeeklyStats {
  weekStart: string
  weekEnd: string
  totalByUser: Record<string, number>
  completionsByUser: Record<string, number>
}

export interface ExpenseCategory {
  id: string
  name: string
  isActive: boolean
  createdAt: Date
}

export interface PaymentMethod {
  id: string
  name: string
  isActive: boolean
  createdAt: Date
}

export interface Expense {
  id: string
  date: Date
  amount: number
  description: string
  note: string | null
  isSplit: boolean
  splitPeople: number | null
  splitDetails: string | null
  mySharePercent: number | null
  categoryId: string
  category?: ExpenseCategory
  paymentMethodId: string
  paymentMethod?: PaymentMethod
  createdAt: Date
  updatedAt: Date
}

export interface SplitDetail {
  name: string
  percent: number
}

export interface ExpenseSummary {
  totalAmount: number
  expenseCount: number
  avgPerDay: number
  topCategory: string | null
  byCategory: { name: string; total: number }[]
  byPaymentMethod: { name: string; total: number }[]
  vsLastMonth: { amount: number; percentChange: number } | null
  dailyTotals: { date: string; total: number }[]
}

export type RecurrenceType = 'daily' | 'weekly' | 'once' | string // string for specific days like "mon,thu"

export const DAYS_OF_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
export type DayOfWeek = typeof DAYS_OF_WEEK[number]
