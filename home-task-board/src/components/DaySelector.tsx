'use client'

import { cn } from '@/lib/utils'
import { DAYS_OF_WEEK } from '@/lib/types'

interface DaySelectorProps {
  selectedDays: string[]
  onChange: (days: string[]) => void
  className?: string
}

const dayLabels: Record<string, string> = {
  sun: 'S',
  mon: 'M',
  tue: 'T',
  wed: 'W',
  thu: 'T',
  fri: 'F',
  sat: 'S',
}

export function DaySelector({ selectedDays, onChange, className }: DaySelectorProps) {
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day))
    } else {
      onChange([...selectedDays, day])
    }
  }

  return (
    <div className={cn('flex gap-1', className)}>
      {DAYS_OF_WEEK.map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => toggleDay(day)}
          className={cn(
            'w-9 h-9 rounded-full font-medium text-sm transition-colors',
            selectedDays.includes(day)
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {dayLabels[day]}
        </button>
      ))}
    </div>
  )
}
