'use client'

import { useState, useEffect } from 'react'
import { Card, Button, EmptyState, Modal, Input, Textarea } from '@/components'
import type { User, Reward } from '@/lib/types'

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newReward, setNewReward] = useState({ name: '', description: '', pointsCost: 50 })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [rewardsRes, usersRes] = await Promise.all([
        fetch('/api/rewards'),
        fetch('/api/users'),
      ])
      const [rewardsData, usersData] = await Promise.all([
        rewardsRes.json(),
        usersRes.json(),
      ])
      setRewards(rewardsData)
      setUsers(usersData)
      if (usersData.length > 0 && !selectedUserId) {
        setSelectedUserId(usersData[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function redeemReward(rewardId: string) {
    if (!selectedUserId) return

    const reward = rewards.find(r => r.id === rewardId)
    const user = users.find(u => u.id === selectedUserId)

    if (!reward || !user) return

    if (!confirm(`Redeem "${reward.name}" for ${reward.pointsCost} points?`)) return

    setRedeeming(rewardId)
    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId, userId: selectedUserId }),
      })

      if (res.ok) {
        alert(`${user.name} redeemed "${reward.name}"!`)
        fetchData() // Refresh to get updated points
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to redeem reward')
      }
    } catch (error) {
      console.error('Failed to redeem reward:', error)
    } finally {
      setRedeeming(null)
    }
  }

  async function createReward() {
    if (!newReward.name.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReward),
      })
      if (res.ok) {
        setShowAddModal(false)
        setNewReward({ name: '', description: '', pointsCost: 50 })
        fetchData()
      }
    } catch (error) {
      console.error('Failed to create reward:', error)
    } finally {
      setCreating(false)
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
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards Shop</h1>
          <p className="text-gray-500">Spend your hard-earned points</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>+ Add Reward</Button>
      </header>

      {users.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who's redeeming?
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
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available Points</p>
              <p className="text-3xl font-bold text-primary-600">
                {selectedUser.spendablePoints}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Lifetime Earned</p>
              <p className="text-xl font-semibold text-gray-400">
                {selectedUser.lifetimePoints}
              </p>
            </div>
          </div>
        </Card>
      )}

      {rewards.length === 0 ? (
        <EmptyState
          title="No rewards yet"
          description="Add rewards that family members can redeem with their points."
          icon="rewards"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rewards.map((reward) => {
            const canAfford = selectedUser && selectedUser.spendablePoints >= reward.pointsCost

            return (
              <Card key={reward.id}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{reward.name}</h3>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold">
                      {reward.pointsCost} pts
                    </span>
                  </div>
                  {reward.description && (
                    <p className="text-gray-500 text-sm mb-4">{reward.description}</p>
                  )}
                  <Button
                    onClick={() => redeemReward(reward.id)}
                    disabled={!canAfford || redeeming === reward.id}
                    variant={canAfford ? 'primary' : 'secondary'}
                    className="w-full"
                  >
                    {redeeming === reward.id
                      ? 'Redeeming...'
                      : canAfford
                      ? 'Redeem'
                      : `Need ${reward.pointsCost - (selectedUser?.spendablePoints || 0)} more pts`}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Reward"
      >
        <div className="space-y-4">
          <Input
            label="Reward Name"
            value={newReward.name}
            onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
            placeholder="e.g., Pizza Night, Extra Screen Time"
          />
          <Textarea
            label="Description (optional)"
            value={newReward.description}
            onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
            placeholder="What does this reward include?"
          />
          <Input
            label="Point Cost"
            type="number"
            value={newReward.pointsCost}
            onChange={(e) => setNewReward({ ...newReward, pointsCost: parseInt(e.target.value) || 0 })}
            min={1}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={createReward} disabled={creating || !newReward.name.trim()}>
              {creating ? 'Creating...' : 'Add Reward'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
