import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/tasks/[id] - Get a single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedUser: true,
        createdBy: true,
        completions: {
          take: 10,
          orderBy: { completedAt: 'desc' },
          include: { user: true },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, points, recurrence, assignedUserId, isActive } = body

    const updateData: Record<string, unknown> = {}

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
      }
      updateData.title = title.trim()
    }

    if (points !== undefined) {
      if (typeof points !== 'number' || points < 1) {
        return NextResponse.json({ error: 'Points must be a positive number' }, { status: 400 })
      }
      updateData.points = points
    }

    if (recurrence !== undefined) {
      updateData.recurrence = recurrence
    }

    if (assignedUserId !== undefined) {
      updateData.assignedUserId = assignedUserId || null
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedUser: true,
        createdBy: true,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.task.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
