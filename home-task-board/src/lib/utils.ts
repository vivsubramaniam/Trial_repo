import { clsx, type ClassValue } from 'clsx'
import { format, startOfDay, startOfWeek, endOfWeek, isToday, isSameDay, parseISO } from 'date-fns'
import { DAYS_OF_WEEK, type DayOfWeek } from './types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'h:mm a')
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function getStartOfDay(date: Date = new Date()): Date {
  return startOfDay(date)
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 }),
  }
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function isTaskAvailableToday(recurrence: string): boolean {
  if (recurrence === 'daily') return true
  if (recurrence === 'once') return true
  if (recurrence === 'weekly') {
    // Weekly tasks are available on Sunday (day 0)
    return new Date().getDay() === 0
  }

  // Check specific days (e.g., "mon,thu")
  const today = DAYS_OF_WEEK[new Date().getDay()]
  const scheduledDays = recurrence.toLowerCase().split(',').map(d => d.trim())
  return scheduledDays.includes(today)
}

export function getDayName(day: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
}

export function getShortDayName(day: number): DayOfWeek {
  return DAYS_OF_WEEK[day]
}

export function calculateStreakBonus(currentBonus: number, lastActiveDate: Date | null): number {
  if (!lastActiveDate) return 1

  const today = startOfDay(new Date())
  const lastActive = startOfDay(new Date(lastActiveDate))

  // If last active was today, keep current bonus
  if (isSameDay(today, lastActive)) {
    return currentBonus
  }

  // If last active was yesterday, increment bonus (max 7, then reset to 1)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameDay(yesterday, lastActive)) {
    // Streak continues
    if (currentBonus >= 7) {
      return 1 // Reset after reaching 7
    }
    return currentBonus + 1
  }

  // Streak broken - reset to 1
  return 1
}

export function shouldResetStreak(lastActiveDate: Date | null): boolean {
  if (!lastActiveDate) return false

  const today = startOfDay(new Date())
  const lastActive = startOfDay(new Date(lastActiveDate))
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // If last active was before yesterday, streak is broken
  return lastActive < yesterday
}

export function getRecurrenceLabel(recurrence: string): string {
  if (recurrence === 'daily') return 'Daily'
  if (recurrence === 'weekly') return 'Weekly'
  if (recurrence === 'once') return 'One-time'

  // Specific days
  const days = recurrence.split(',').map(d => {
    const day = d.trim().toLowerCase()
    const dayIndex = DAYS_OF_WEEK.indexOf(day as DayOfWeek)
    if (dayIndex >= 0) {
      return getDayName(dayIndex).slice(0, 3)
    }
    return d
  })

  return days.join(', ')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`)
}
