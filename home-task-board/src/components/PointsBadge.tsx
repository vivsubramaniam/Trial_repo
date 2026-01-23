'use client'

import { cn } from '@/lib/utils'

interface PointsBadgeProps {
  points: number
  bonus?: number
  size?: 'sm' | 'md' | 'lg'
  showPlus?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

export function PointsBadge({ points, bonus, size = 'md', showPlus = false, className }: PointsBadgeProps) {
  const total = points + (bonus || 0)

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <span
        className={cn(
          'inline-flex items-center rounded-full font-semibold bg-amber-100 text-amber-800',
          sizeClasses[size]
        )}
      >
        {showPlus && '+'}{total} pts
      </span>
      {bonus !== undefined && bonus > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full font-medium bg-green-100 text-green-700',
            size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
          )}
        >
          +{bonus} bonus
        </span>
      )}
    </div>
  )
}
