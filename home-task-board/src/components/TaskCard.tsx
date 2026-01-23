'use client'

import { useState } from 'react'
import { UserAvatar } from './UserAvatar'
import { PointsBadge } from './PointsBadge'
import { cn, getRecurrenceLabel } from '@/lib/utils'
import type { Task, User, TaskCompletion } from '@/lib/types'

interface TaskCardProps {
  task: Task & { assignedUser?: User | null }
  currentUser?: User | null
  completedBy?: (TaskCompletion & { user: User }) | null
  onComplete?: (taskId: string) => void
  onEdit?: (taskId: string) => void
  showActions?: boolean
  className?: string
}

export function TaskCard({
  task,
  currentUser,
  completedBy,
  onComplete,
  onEdit,
  showActions = true,
  className,
}: TaskCardProps) {
  const isCompleted = !!completedBy
  const isShared = !task.assignedUserId
  const isAssignedToCurrentUser = task.assignedUserId === currentUser?.id
  const canComplete = !isCompleted && (isShared || isAssignedToCurrentUser)

  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-4 transition-all',
        isCompleted
          ? 'border-green-200 bg-green-50/50'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                'font-semibold truncate',
                isCompleted ? 'text-green-800' : 'text-gray-900'
              )}
            >
              {task.title}
            </h3>
            {isCompleted && <span className="text-green-600">✓</span>}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <span>📅</span>
              {getRecurrenceLabel(task.recurrence)}
            </span>
            {task.assignedUser ? (
              <span className="inline-flex items-center gap-1">
                <span>👤</span>
                {task.assignedUser.name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-primary-600">
                <span>👥</span>
                Shared
              </span>
            )}
          </div>

          {isCompleted && completedBy && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-gray-500">Done by</span>
              <UserAvatar
                name={completedBy.user.name}
                photoPath={completedBy.user.photoPath}
                size="sm"
                showName
              />
              {completedBy.notes && (
                <span className="text-gray-400 italic truncate">
                  &quot;{completedBy.notes}&quot;
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <PointsBadge
            points={task.points}
            bonus={isCompleted ? completedBy?.bonusPoints : undefined}
          />

          {showActions && canComplete && onComplete && (
            <button
              onClick={() => onComplete(task.id)}
              className="px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              Complete
            </button>
          )}

          {showActions && onEdit && !isCompleted && (
            <button
              onClick={() => onEdit(task.id)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
