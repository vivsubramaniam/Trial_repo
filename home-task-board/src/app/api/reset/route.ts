import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/reset - Reset all data (for testing only)
export async function POST() {
  try {
    // Delete in order to respect foreign key constraints
    await prisma.rewardRedemption.deleteMany()
    await prisma.taskCompletion.deleteMany()
    await prisma.task.deleteMany()
    await prisma.user.deleteMany()
    await prisma.reward.deleteMany()

    // Everything is wiped clean

    return NextResponse.json({ success: true, message: 'All data has been reset' })
  } catch (error) {
    console.error('Error resetting data:', error)
    return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 })
  }
}
