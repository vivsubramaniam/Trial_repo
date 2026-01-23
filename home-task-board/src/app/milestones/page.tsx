'use client'

import { useState, useEffect } from 'react'
import { Card, EmptyState, UserAvatar } from '@/components'
import type { User, Milestone, MilestoneRedemption } from '@/lib/types'

interface MilestoneWithRedemptions extends Milestone {
  redemptions: Array<MilestoneRedemption & { user: User }>
}

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<MilestoneWithRedemptions[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [milestonesRes, usersRes] = await Promise.all([
        fetch('/api/milestones'),
        fetch('/api/users'),
      ])
      const [milestonesData, usersData] = await Promise.all([
        milestonesRes.json(),
        usersRes.json(),
      ])
      setMilestones(milestonesData)
      setUsers(usersData)
      if (usersData.length > 0) {
        setSelectedUserId(usersData[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
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

  const selectedUser = users.find((u) => u.id === selectedUserId)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>
        <p className="text-gray-500">Milestones and achievements</p>
      </header>

      {users.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Viewing progress for:
          </label>
          <div className="flex gap-2 flex-wrap">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedUserId === user.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {user.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedUser && (
        <Card className="mb-6">
          <div className="p-4">
            <p className="text-sm text-gray-500">Current Points</p>
            <p className="text-3xl font-bold text-primary-600">
              {selectedUser.lifetimePoints}
            </p>
          </div>
        </Card>
      )}

      {milestones.length === 0 ? (
        <EmptyState
          title="No milestones"
          description="Milestones will appear here."
          icon="rewards"
        />
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone) => {
            const isAchieved = selectedUser
              ? selectedUser.lifetimePoints >= milestone.pointsRequired
              : false
            const userRedemption = milestone.redemptions?.find(
              (r) => r.userId === selectedUserId
            )

            return (
              <Card key={milestone.id}>
                <div className={`p-4 ${isAchieved ? '' : 'opacity-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">
                      {isAchieved ? '🏆' : '🔒'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {milestone.rewardName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {milestone.description || `Reach ${milestone.pointsRequired} points`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isAchieved ? 'text-green-500' : 'text-gray-400'}`}>
                        {milestone.pointsRequired} pts
                      </p>
                      {isAchieved && (
                        <p className="text-xs text-green-500">Unlocked!</p>
                      )}
                    </div>
                  </div>
                  {selectedUser && !isAchieved && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              (selectedUser.lifetimePoints / milestone.pointsRequired) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {milestone.pointsRequired - selectedUser.lifetimePoints} points to go
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
