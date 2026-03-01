import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { startOfMonth, endOfMonth, parseISO } from 'date-fns'

// GET /api/expenses - Get expenses with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // format: YYYY-MM
    const categoryId = searchParams.get('categoryId')

    const where: Record<string, unknown> = {}

    if (month) {
      const monthDate = parseISO(`${month}-01`)
      where.date = {
        gte: startOfMonth(monthDate),
        lte: endOfMonth(monthDate),
      }
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        paymentMethod: true,
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

// POST /api/expenses - Create an expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, amount, description, note, categoryId, paymentMethodId, isSplit, splitPeople, splitDetails, mySharePercent } = body

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        date: new Date(`${date}T12:00:00`),
        amount,
        description: description.trim(),
        note: note?.trim() || null,
        isSplit: isSplit || false,
        splitPeople: isSplit ? splitPeople : null,
        splitDetails: isSplit && splitDetails ? JSON.stringify(splitDetails) : null,
        mySharePercent: isSplit ? mySharePercent : null,
        categoryId,
        paymentMethodId,
      },
      include: {
        category: true,
        paymentMethod: true,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
