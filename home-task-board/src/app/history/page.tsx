'use client'

import { useState, useEffect } from 'react'
import { Card, EmptyState } from '@/components'
import { formatDate, formatTime } from '@/lib/utils'
import type { TaskCompletion } from '@/lib/types'

interface CompletionWithDetails extends Omit<TaskCompletion, 'task' | 'user'> {
  task: { title: string }
  user: { name: string }
}

export default function HistoryPage() {
  const [completions, setCompletions] = useState<CompletionWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompletions()
  }, [])

  async function fetchCompletions() {
    try {
      const res = await fetch('/api/completions?limit=50')
      const data = await res.json()
      setCompletions(data)
    } catch (error) {
      console.error('Failed to fetch completions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Group completions by date
  const groupedByDate = completions.reduce((acc, completion) => {
    const date = formatDate(completion.completedAt)
    if (!acc[date]) acc[date] = []
    acc[date].push(completion)
    return acc
  }, {} as Record<string, CompletionWithDetails[]>)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">History</h1>
        <p className="text-gray-500">Recent task completions</p>
      </header>

      {completions.length === 0 ? (
        <EmptyState
          title="No history yet"
          description="Complete some tasks to see them here."
          icon="history"
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, dayCompletions]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-gray-500 mb-2">{date}</h2>
              <div className="space-y-2">
                {dayCompletions.map((completion) => (
                  <Card key={completion.id}>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{completion.task.title}</h3>
                        <p className="text-sm text-gray-500">
                          {completion.user.name} at {formatTime(completion.completedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">
                          +{completion.basePoints + completion.bonusPoints} pts
                        </p>
                        {completion.bonusPoints > 0 && (
                          <p className="text-xs text-green-500">
                            (+{completion.bonusPoints} bonus)
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
