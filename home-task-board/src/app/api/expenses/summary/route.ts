import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { startOfMonth, endOfMonth, subMonths, parseISO, format, getDaysInMonth } from 'date-fns'

// GET /api/expenses/summary?month=YYYY-MM - Get monthly expense summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || format(new Date(), 'yyyy-MM')

    const monthDate = parseISO(`${month}-01`)
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)

    // Fetch current month expenses
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: monthStart, lte: monthEnd },
      },
      include: {
        category: true,
        paymentMethod: true,
      },
      orderBy: { date: 'asc' },
    })

    // Fetch previous month expenses for comparison
    const prevMonthDate = subMonths(monthDate, 1)
    const prevMonthStart = startOfMonth(prevMonthDate)
    const prevMonthEnd = endOfMonth(prevMonthDate)

    const prevExpenses = await prisma.expense.findMany({
      where: {
        date: { gte: prevMonthStart, lte: prevMonthEnd },
      },
    })

    // Calculate totals
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
    const prevTotalAmount = prevExpenses.reduce((sum, e) => sum + e.amount, 0)
    const daysInMonth = getDaysInMonth(monthDate)

    // By category
    const categoryMap = new Map<string, number>()
    for (const e of expenses) {
      const name = e.category.name
      categoryMap.set(name, (categoryMap.get(name) || 0) + e.amount)
    }
    const byCategory = Array.from(categoryMap.entries())
      .map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total)

    // By payment method
    const methodMap = new Map<string, number>()
    for (const e of expenses) {
      const name = e.paymentMethod.name
      methodMap.set(name, (methodMap.get(name) || 0) + e.amount)
    }
    const byPaymentMethod = Array.from(methodMap.entries())
      .map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total)

    // Daily totals
    const dailyMap = new Map<string, number>()
    for (const e of expenses) {
      const day = format(new Date(e.date), 'yyyy-MM-dd')
      dailyMap.set(day, (dailyMap.get(day) || 0) + e.amount)
    }
    const dailyTotals = Array.from(dailyMap.entries())
      .map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // vs last month
    const vsLastMonth = prevExpenses.length > 0
      ? {
          amount: Math.round(prevTotalAmount * 100) / 100,
          percentChange: prevTotalAmount > 0
            ? Math.round(((totalAmount - prevTotalAmount) / prevTotalAmount) * 1000) / 10
            : 0,
        }
      : null

    const summary = {
      totalAmount: Math.round(totalAmount * 100) / 100,
      expenseCount: expenses.length,
      avgPerDay: Math.round((totalAmount / daysInMonth) * 100) / 100,
      topCategory: byCategory.length > 0 ? byCategory[0].name : null,
      byCategory,
      byPaymentMethod,
      vsLastMonth,
      dailyTotals,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching expense summary:', error)
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
  }
}
