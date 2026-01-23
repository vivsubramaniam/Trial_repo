'use client'

import { cn } from '@/lib/utils'

interface StreakDisplayProps {
  streak: number
  bonus: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StreakDisplay({ streak, bonus, size = 'md', className }: StreakDisplayProps) {
  const isOnFire = streak >= 7

  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-2',
    lg: 'text-lg gap-2',
  }

  const iconSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className={cn('flex items-center', sizeClasses[size], className)}>
      <span className={cn(iconSizes[size], isOnFire ? 'animate-pulse' : '')}>
        {isOnFire ? '🔥' : '⚡'}
      </span>
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900">
          {streak} day{streak !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-gray-500">
          +{bonus} bonus
        </span>
      </div>
    </div>
  )
}
