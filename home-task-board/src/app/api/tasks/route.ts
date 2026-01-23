import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isTaskAvailableToday } from '@/lib/utils'
import { startOfDay, endOfDay } from 'date-fns'

// GET /api/tasks - Get tasks (optionally filtered for today)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const today = searchParams.get('today') === 'true'
    const userId = searchParams.get('userId')

    const tasks = await prisma.task.findMany({
      where: {
        isActive: true,
        ...(userId && { assignedUserId: userId }),
      },
      include: {
        assignedUser: true,
        createdBy: true,
        completions: {
          where: {
            completedAt: {
              gte: startOfDay(new Date()),
              lte: endOfDay(new Date()),
            },
          },
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter for today's tasks if requested
    const filteredTasks = today
      ? tasks.filter((task) => isTaskAvailableToday(task.recurrence))
      : tasks

    return NextResponse.json(filteredTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, points, recurrence, assignedUserId, createdById } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!points || typeof points !== 'number' || points < 1) {
      return NextResponse.json({ error: 'Points must be a positive number' }, { status: 400 })
    }

    if (!recurrence) {
      return NextResponse.json({ error: 'Recurrence is required' }, { status: 400 })
    }

    if (!createdById) {
      return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        points,
        recurrence,
        assignedUserId: assignedUserId || null,
        createdById,
      },
      include: {
        assignedUser: true,
        createdBy: true,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
