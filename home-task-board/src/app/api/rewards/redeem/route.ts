import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/rewards/redeem - Redeem a reward (spend points)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rewardId, userId } = body

    if (!rewardId) {
      return NextResponse.json({ error: 'Reward ID is required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get reward and user
    const [reward, user] = await Promise.all([
      prisma.reward.findUnique({ where: { id: rewardId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ])

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    if (!reward.isActive) {
      return NextResponse.json({ error: 'Reward is not available' }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.spendablePoints < reward.pointsCost) {
      return NextResponse.json(
        { error: `Not enough points. Need ${reward.pointsCost}, have ${user.spendablePoints}` },
        { status: 400 }
      )
    }

    // Create redemption and deduct points in a transaction
    const [redemption] = await prisma.$transaction([
      prisma.rewardRedemption.create({
        data: {
          rewardId,
          userId,
          pointsSpent: reward.pointsCost,
        },
        include: {
          reward: true,
          user: true,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          spendablePoints: { decrement: reward.pointsCost },
        },
      }),
    ])

    return NextResponse.json(redemption, { status: 201 })
  } catch (error) {
    console.error('Error redeeming reward:', error)
    return NextResponse.json({ error: 'Failed to redeem reward' }, { status: 500 })
  }
}
