import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/expenses/[id] - Get a single expense
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
        paymentMethod: true,
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 })
  }
}

// PATCH /api/expenses/[id] - Update an expense
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { date, amount, description, note, categoryId, paymentMethodId, isSplit, splitPeople, splitDetails, mySharePercent } = body

    const updateData: Record<string, unknown> = {}

    if (date !== undefined) {
      updateData.date = new Date(`${date}T12:00:00`)
    }

    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
      }
      updateData.amount = amount
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim().length === 0) {
        return NextResponse.json({ error: 'Description cannot be empty' }, { status: 400 })
      }
      updateData.description = description.trim()
    }

    if (note !== undefined) {
      updateData.note = note?.trim() || null
    }

    if (categoryId !== undefined) {
      updateData.categoryId = categoryId
    }

    if (paymentMethodId !== undefined) {
      updateData.paymentMethodId = paymentMethodId
    }

    if (isSplit !== undefined) {
      updateData.isSplit = isSplit
      if (isSplit) {
        if (splitPeople !== undefined) updateData.splitPeople = splitPeople
        if (splitDetails !== undefined) updateData.splitDetails = JSON.stringify(splitDetails)
        if (mySharePercent !== undefined) updateData.mySharePercent = mySharePercent
      } else {
        updateData.splitPeople = null
        updateData.splitDetails = null
        updateData.mySharePercent = null
      }
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        paymentMethod: true,
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.expense.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
