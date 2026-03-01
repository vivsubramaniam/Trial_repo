import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/rewards - Get all rewards
export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: 'asc' },
    })
    return NextResponse.json(rewards)
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 })
  }
}

// POST /api/rewards - Create a new reward
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, pointsCost } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!pointsCost || typeof pointsCost !== 'number' || pointsCost < 1) {
      return NextResponse.json({ error: 'Points cost must be a positive number' }, { status: 400 })
    }

    const reward = await prisma.reward.create({
      data: {
        name: name.trim(),
        description: description || null,
        pointsCost,
      },
    })

    return NextResponse.json(reward, { status: 201 })
  } catch (error) {
    console.error('Error creating reward:', error)
    return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 })
  }
}
