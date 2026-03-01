'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, Select, Modal, EmptyState } from '@/components'
import { getRecurrenceLabel, formatDate } from '@/lib/utils'
import type { Task, User } from '@/lib/types'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    points: 5,
    recurrence: 'daily',
    assignedUserId: '',
    deadline: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/users'),
      ])
      const [tasksData, usersData] = await Promise.all([
        tasksRes.json(),
        usersRes.json(),
      ])
      setTasks(tasksData)
      setUsers(usersData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setEditingTask(null)
    setFormData({ title: '', points: 5, recurrence: 'daily', assignedUserId: '', deadline: '' })
    setShowModal(true)
  }

  function openEditModal(task: Task) {
    setEditingTask(task)
    setFormData({
      title: task.title,
      points: task.points,
      recurrence: task.recurrence,
      assignedUserId: task.assignedUserId || '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
    })
    setShowModal(true)
  }

  async function saveTask() {
    if (!formData.title.trim()) return
    if (users.length === 0) {
      alert('Please add a family member first')
      return
    }
    setSaving(true)

    try {
      if (editingTask) {
        await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title.trim(),
            points: formData.points,
            recurrence: formData.recurrence,
            assignedUserId: formData.assignedUserId || null,
            deadline: formData.deadline || null,
          }),
        })
      } else {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title.trim(),
            points: formData.points,
            recurrence: formData.recurrence,
            assignedUserId: formData.assignedUserId || null,
            deadline: formData.deadline || null,
            createdById: users[0].id,
          }),
        })
      }
      setShowModal(false)
      fetchData()
    } catch (error) {
      console.error('Failed to save task:', error)
    } finally {
      setSaving(false)
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete task:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-500">Manage household tasks</p>
        </div>
        <Button onClick={openAddModal}>+ Add Task</Button>
      </header>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to get started."
          icon="tasks"
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id}>
              <div className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-500">
                    {task.points} pts | {getRecurrenceLabel(task.recurrence)}
                    {task.deadline && ` | Due: ${formatDate(new Date(task.deadline))}`}
                    {task.assignedUser && ` | Assigned to ${task.assignedUser.name}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEditModal(task)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => deleteTask(task.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <div className="space-y-4">
          <Input
            label="Task Name"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Take out trash"
            autoFocus
          />
          <Input
            label="Points"
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
            min={1}
          />
          <Select
            label="Recurrence"
            value={formData.recurrence}
            onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly (Sundays)' },
              { value: 'once', label: 'One-time' },
              { value: 'mon,wed,fri', label: 'Mon, Wed, Fri' },
              { value: 'tue,thu', label: 'Tue, Thu' },
              { value: 'sat,sun', label: 'Weekends' },
            ]}
          />
          <Input
            label="Deadline (optional)"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
          <Select
            label="Assign To (optional)"
            value={formData.assignedUserId}
            onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
            options={[
              { value: '', label: 'Anyone' },
              ...users.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveTask} disabled={saving || !formData.title.trim()}>
              {saving ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
