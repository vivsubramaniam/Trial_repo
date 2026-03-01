'use client'

import { useState, useEffect } from 'react'
import { Card, UserAvatar, EmptyState } from '@/components'
import type { User } from '@/lib/types'

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      // Sort by lifetime points descending
      const sorted = data.sort((a: User, b: User) => b.lifetimePoints - a.lifetimePoints)
      setUsers(sorted)
    } catch (error) {
      console.error('Failed to fetch users:', error)
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

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-500">See who's earning the most points</p>
      </header>

      {users.length === 0 ? (
        <EmptyState
          title="No members yet"
          description="Add family members to see the leaderboard."
          icon="users"
        />
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => (
            <Card key={user.id}>
              <div className="p-4 flex items-center gap-4">
                <div className="text-2xl w-8 text-center">
                  {index < 3 ? medals[index] : `#${index + 1}`}
                </div>
                <UserAvatar name={user.name} photoPath={user.photoPath} size="lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">
                    {user.currentStreak} day streak
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">
                    {user.spendablePoints}
                  </p>
                  <p className="text-xs text-gray-500">available</p>
                  <p className="text-xs text-gray-400">{user.lifetimePoints} lifetime</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
