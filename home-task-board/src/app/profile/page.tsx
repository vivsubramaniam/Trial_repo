'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, Modal, UserAvatar } from '@/components'
import type { User } from '@/lib/types'

export default function ProfilePage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setEditingUser(null)
    setName('')
    setShowModal(true)
  }

  function openEditModal(user: User) {
    setEditingUser(user)
    setName(user.name)
    setShowModal(true)
  }

  async function saveUser() {
    if (!name.trim()) return
    setSaving(true)

    try {
      if (editingUser) {
        await fetch(`/api/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() }),
        })
      } else {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() }),
        })
      }
      setShowModal(false)
      fetchUsers()
    } catch (error) {
      console.error('Failed to save user:', error)
    } finally {
      setSaving(false)
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this family member?')) return

    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  async function resetAllData() {
    if (!confirm('This will delete ALL users, tasks, and points. Are you sure?')) return
    if (!confirm('Really? This cannot be undone!')) return

    setResetting(true)
    try {
      const res = await fetch('/api/reset', { method: 'POST' })
      if (res.ok) {
        setUsers([])
        alert('All data has been reset!')
      }
    } catch (error) {
      console.error('Failed to reset data:', error)
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
          <p className="text-gray-500">Manage your household</p>
        </div>
        <Button onClick={openAddModal}>+ Add Member</Button>
      </header>

      {users.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No family members yet.</p>
            <Button onClick={openAddModal}>Add Your First Member</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <div className="p-4 flex items-center gap-4">
                <UserAvatar name={user.name} photoPath={user.photoPath} size="lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">
                    {user.lifetimePoints} points | {user.currentStreak} day streak
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEditModal(user)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => deleteUser(user.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Testing Tools */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Testing Tools</h2>
        <Button
          variant="danger"
          onClick={resetAllData}
          disabled={resetting}
        >
          {resetting ? 'Resetting...' : 'Reset All Data'}
        </Button>
        <p className="text-xs text-gray-400 mt-2">
          Deletes all users, tasks, completions, and points. Milestones are kept.
        </p>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit Member' : 'Add Family Member'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Mom, Dad, Alex"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveUser} disabled={saving || !name.trim()}>
              {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Add Member'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
