'use client'

import { useState } from 'react'
import { UserAvatar } from './UserAvatar'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/types'

interface UserSelectorProps {
  users: User[]
  selectedUserId?: string | null
  onSelect: (userId: string) => void
  label?: string
  allowNone?: boolean
  noneLabel?: string
  className?: string
}

export function UserSelector({
  users,
  selectedUserId,
  onSelect,
  label = 'Select person',
  allowNone = false,
  noneLabel = 'Anyone',
  className,
}: UserSelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {allowNone && (
          <button
            type="button"
            onClick={() => onSelect('')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all',
              !selectedUserId
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">👥</span>
            </div>
            <span className="font-medium text-gray-700">{noneLabel}</span>
          </button>
        )}
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => onSelect(user.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all',
              selectedUserId === user.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <UserAvatar name={user.name} photoPath={user.photoPath} size="sm" />
            <span className="font-medium text-gray-700">{user.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
