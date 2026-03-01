import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/payment-methods - Get all active payment methods
export async function GET() {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(methods)
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 })
  }
}

// POST /api/payment-methods - Create a payment method
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const method = await prisma.paymentMethod.create({
      data: { name: name.trim() },
    })

    return NextResponse.json(method, { status: 201 })
  } catch (error) {
    console.error('Error creating payment method:', error)
    return NextResponse.json({ error: 'Failed to create payment method' }, { status: 500 })
  }
}
