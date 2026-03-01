import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/expense-categories - Get all active categories
export async function GET() {
  try {
    const categories = await prisma.expenseCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching expense categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST /api/expense-categories - Create a category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const category = await prisma.expenseCategory.create({
      data: { name: name.trim() },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating expense category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
