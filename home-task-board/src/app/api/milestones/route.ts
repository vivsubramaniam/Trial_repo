import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/milestones - Get all milestones with redemptions
export async function GET() {
  try {
    const milestones = await prisma.milestone.findMany({
      orderBy: { pointsRequired: 'asc' },
      include: {
        redemptions: {
          include: {
            user: true,
          },
        },
      },
    })
    return NextResponse.json(milestones)
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 })
  }
}
