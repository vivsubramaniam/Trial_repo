'use client'

import { useState, useEffect } from 'react'
import { TaskCard, UserSelector, Card, CardHeader, EmptyState, Button, Modal, Input, Select, Textarea } from '@/components'
import type { Task, User } from '@/lib/types'

interface CompletionData {
  id: string
  userId: string
  basePoints: number
  bonusPoints: number
  user: User
}

interface TaskWithCompletions extends Task {
  completions: CompletionData[]
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<TaskWithCompletions[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', points: 5, recurrence: 'daily', assignedUserId: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch('/api/tasks?today=true'),
        fetch('/api/users'),
      ])
      const [tasksData, usersData] = await Promise.all([
        tasksRes.json(),
        usersRes.json(),
      ])
      setTasks(tasksData)
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

  async function completeTask(taskId: string) {
    if (!selectedUserId) return
    setCompleting(taskId)
    try {
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, userId: selectedUserId }),
      })
      if (res.ok) {
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to complete task')
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
    } finally {
      setCompleting(null)
    }
  }

  async function createTask() {
    if (!selectedUserId || !newTask.title.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          points: newTask.points,
          recurrence: newTask.recurrence,
          assignedUserId: newTask.assignedUserId || null,
          createdById: selectedUserId,
        }),
      })
      if (res.ok) {
        setShowTaskModal(false)
        setNewTask({ title: '', points: 5, recurrence: 'daily', assignedUserId: '' })
        fetchData()
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setCreating(false)
    }
  }

  const selectedUser = users.find((u) => u.id === selectedUserId)

  // For shared tasks: done if ANYONE completed it
  // For assigned tasks: done if the assigned user completed it
  const isTaskDone = (task: TaskWithCompletions) => {
    if (!task.assignedUserId) {
      // Shared task - completed if anyone did it
      return task.completions.length > 0
    }
    // Assigned task - completed if assigned user did it
    return task.completions.some((c) => c.userId === task.assignedUserId)
  }

  const pendingTasks = tasks.filter((t) => !isTaskDone(t))
  const completedTasks = tasks.filter((t) => isTaskDone(t))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today's Tasks</h1>
        <p className="text-gray-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </header>

      {users.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Welcome to Home Task Board!</h2>
            <p className="text-gray-500 mb-4">Create your first family member to get started.</p>
            <Button onClick={() => window.location.href = '/profile'}>
              Add Family Member
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who's completing tasks?
            </label>
            <UserSelector
              users={users}
              selectedUserId={selectedUserId}
              onSelect={setSelectedUserId}
            />
          </div>

          {selectedUser && (
            <Card className="mb-6">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {selectedUser.spendablePoints} pts
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Streak</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {selectedUser.currentStreak} days
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bonus</p>
                  <p className="text-2xl font-bold text-green-500">
                    +{selectedUser.streakBonus}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending ({pendingTasks.length})
            </h2>
            <Button onClick={() => setShowTaskModal(true)} size="sm">
              + Add Task
            </Button>
          </div>

          {pendingTasks.length === 0 ? (
            <EmptyState
              title="All done!"
              description="You've completed all tasks for today."
              icon="checkmark"
            />
          ) : (
            <div className="space-y-3 mb-8">
              {pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUser={selectedUser}
                  onComplete={() => completeTask(task.id)}
                />
              ))}
            </div>
          )}

          {completedTasks.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Completed ({completedTasks.length})
              </h2>
              <div className="space-y-3 opacity-60">
                {completedTasks.map((task) => {
                  // Show who actually completed it (first completion for shared tasks)
                  const completion = task.completions[0]
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      currentUser={selectedUser}
                      completedBy={completion}
                      showActions={false}
                    />
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Add New Task"
      >
        <div className="space-y-4">
          <Input
            label="Task Name"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="e.g., Take out trash"
          />
          <Input
            label="Points"
            type="number"
            value={newTask.points}
            onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) || 0 })}
            min={1}
          />
          <Select
            label="Recurrence"
            value={newTask.recurrence}
            onChange={(e) => setNewTask({ ...newTask, recurrence: e.target.value })}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'once', label: 'One-time' },
            ]}
          />
          <Select
            label="Assign To"
            value={newTask.assignedUserId}
            onChange={(e) => setNewTask({ ...newTask, assignedUserId: e.target.value })}
            options={[
              { value: '', label: 'Shared (anyone can complete)' },
              ...users.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
              Cancel
            </Button>
            <Button onClick={createTask} disabled={creating || !newTask.title.trim()}>
              {creating ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
