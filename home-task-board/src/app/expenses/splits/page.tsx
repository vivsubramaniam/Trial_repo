'use client'

import { useState, useEffect } from 'react'
import { Card, EmptyState } from '@/components'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Expense, SplitDetail } from '@/lib/types'

interface PersonBalance {
  name: string
  totalOwed: number
  expenses: {
    description: string
    date: Date
    totalAmount: number
    theirPercent: number
    theirAmount: number
  }[]
}

export default function SplitsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSplitExpenses()
  }, [])

  async function fetchSplitExpenses() {
    try {
      // Fetch all expenses and filter to splits client-side
      const res = await fetch('/api/expenses')
      const data: Expense[] = await res.json()
      setExpenses(data.filter((e) => e.isSplit))
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Build per-person balance
  const balanceMap = new Map<string, PersonBalance>()

  for (const expense of expenses) {
    if (!expense.splitDetails) continue
    let details: SplitDetail[] = []
    try { details = JSON.parse(expense.splitDetails) } catch { continue }

    for (const detail of details) {
      const name = detail.name
      if (!balanceMap.has(name)) {
        balanceMap.set(name, { name, totalOwed: 0, expenses: [] })
      }
      const person = balanceMap.get(name)!
      const theirAmount = Math.round(expense.amount * detail.percent) / 100
      person.totalOwed += theirAmount
      person.expenses.push({
        description: expense.description,
        date: new Date(expense.date),
        totalAmount: expense.amount,
        theirPercent: detail.percent,
        theirAmount,
      })
    }
  }

  const people = Array.from(balanceMap.values()).sort((a, b) => b.totalOwed - a.totalOwed)
  const totalOwedToYou = people.reduce((sum, p) => sum + p.totalOwed, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Splits</h1>
        <p className="text-gray-500">Track who owes you from split expenses</p>
      </header>

      {expenses.length === 0 ? (
        <EmptyState
          title="No split expenses"
          description="When you add expenses with splits, they'll show up here."
          icon="🤝"
        />
      ) : (
        <>
          {/* Total owed */}
          <Card className="mb-6">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Owed to You</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(totalOwedToYou)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">People</p>
                <p className="text-xl font-semibold text-gray-700">{people.length}</p>
              </div>
            </div>
          </Card>

          {/* Per-person breakdown */}
          <div className="space-y-4">
            {people.map((person) => (
              <Card key={person.name}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(person.totalOwed)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {person.expenses.map((exp, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-800 truncate block">
                            {exp.description}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(exp.date)} · {exp.theirPercent}% of {formatCurrency(exp.totalAmount)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 ml-3">
                          {formatCurrency(exp.theirAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
