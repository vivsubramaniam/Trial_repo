import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateStreakBonus, shouldResetStreak } from '@/lib/utils'
import { startOfDay, endOfDay, subDays } from 'date-fns'

// GET /api/completions - Get task completions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}

    if (userId) {
      where.userId = userId
    }

    if (date) {
      const targetDate = new Date(date)
      where.completedAt = {
        gte: startOfDay(targetDate),
        lte: endOfDay(targetDate),
      }
    }

    const completions = await prisma.taskCompletion.findMany({
      where,
      include: {
        task: true,
        user: true,
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(completions)
  } catch (error) {
    console.error('Error fetching completions:', error)
    return NextResponse.json({ error: 'Failed to fetch completions' }, { status: 500 })
  }
}

// POST /api/completions - Mark a task as complete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, userId, notes } = body

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get task and user in parallel
    const [task, user] = await Promise.all([
      prisma.task.findUnique({ where: { id: taskId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ])

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if task is already completed today
    if (task.recurrence !== 'once') {
      const existingCompletion = await prisma.taskCompletion.findFirst({
        where: {
          taskId,
          completedAt: {
            gte: startOfDay(new Date()),
            lte: endOfDay(new Date()),
          },
          // For assigned tasks, only check the assigned user
          // For shared tasks, check if anyone completed it
          ...(task.assignedUserId ? { userId: task.assignedUserId } : {}),
        },
      })

      if (existingCompletion) {
        return NextResponse.json(
          { error: 'Task already completed today' },
          { status: 400 }
        )
      }
    }

    // Calculate streak bonus
    const streakBonus = calculateStreakBonus(user.streakBonus, user.lastActiveDate)
    const bonusPoints = streakBonus - 1 // Bonus is the extra points above base
    const totalPoints = task.points + bonusPoints

    // Check if streak should be reset
    const streakReset = shouldResetStreak(user.lastActiveDate)
    const newStreak = streakReset ? 1 : user.currentStreak + 1

    // Create completion and update user in a transaction
    const [completion] = await prisma.$transaction([
      prisma.taskCompletion.create({
        data: {
          taskId,
          userId,
          basePoints: task.points,
          bonusPoints,
          notes: notes || null,
        },
        include: {
          task: true,
          user: true,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          lifetimePoints: { increment: totalPoints },
          currentStreak: newStreak,
          streakBonus,
          lastActiveDate: new Date(),
        },
      }),
      // If it's a one-time task, mark it as inactive
      ...(task.recurrence === 'once'
        ? [
            prisma.task.update({
              where: { id: taskId },
              data: { isActive: false },
            }),
          ]
        : []),
    ])

    // Check for milestone achievements
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (updatedUser) {
      const unredeemedMilestones = await prisma.milestone.findMany({
        where: {
          pointsRequired: { lte: updatedUser.lifetimePoints },
          redemptions: {
            none: { userId },
          },
        },
      })

      // Create milestone redemptions for newly achieved milestones
      if (unredeemedMilestones.length > 0) {
        await prisma.milestoneRedemption.createMany({
          data: unredeemedMilestones.map((m) => ({
            milestoneId: m.id,
            userId,
          })),
        })
      }
    }

    return NextResponse.json(completion, { status: 201 })
  } catch (error) {
    console.error('Error creating completion:', error)
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 })
  }
}
