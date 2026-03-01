'use client'

import { useState, useEffect } from 'react'
import { Card, EmptyState } from '@/components'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import { Input } from '@/components'
import type { ExpenseSummary } from '@/lib/types'

export default function ExpenseSummaryPage() {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [selectedMonth])

  async function fetchSummary() {
    setLoading(true)
    try {
      const res = await fetch(`/api/expenses/summary?month=${selectedMonth}`)
      const data = await res.json()
      setSummary(data)
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const monthLabel = new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expense Summary</h1>
        <p className="text-gray-500">Monthly spending breakdown</p>
      </header>

      <div className="mb-6">
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : !summary || summary.expenseCount === 0 ? (
        <EmptyState
          title="No expenses this month"
          description="Start logging expenses to see your summary here."
          icon="📊"
        />
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <Card>
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(summary.totalAmount)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">Transactions</p>
                <p className="text-2xl font-bold text-gray-700">{summary.expenseCount}</p>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">Avg / Day</p>
                <p className="text-2xl font-bold text-gray-700">
                  {formatCurrency(summary.avgPerDay)}
                </p>
              </div>
            </Card>
          </div>

          {/* vs Last Month */}
          {summary.vsLastMonth && (
            <Card className="mb-8">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">vs Last Month</p>
                  <p className="text-sm text-gray-400">
                    Last month: {formatCurrency(summary.vsLastMonth.amount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    summary.vsLastMonth.percentChange > 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {summary.vsLastMonth.percentChange > 0 ? '+' : ''}
                    {summary.vsLastMonth.percentChange}%
                  </p>
                  <p className="text-xs text-gray-400">
                    {summary.vsLastMonth.percentChange > 0 ? 'more' : 'less'} than last month
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Top Category */}
          {summary.topCategory && (
            <Card className="mb-8">
              <div className="p-4 flex items-center gap-3">
                <span className="text-2xl">🏷️</span>
                <div>
                  <p className="text-sm text-gray-500">Top Spending Category</p>
                  <p className="font-semibold text-gray-900">{summary.topCategory}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(summary.byCategory[0]?.total || 0)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {Math.round(((summary.byCategory[0]?.total || 0) / summary.totalAmount) * 100)}% of total
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* By Category */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">By Category</h2>
            <Card>
              <div className="divide-y divide-gray-100">
                {summary.byCategory.map((item) => {
                  const pct = Math.round((item.total / summary.totalAmount) * 100)
                  return (
                    <div key={item.name} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-medium text-gray-900 w-36 truncate">{item.name}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 hidden sm:block">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className="font-semibold text-gray-900">{formatCurrency(item.total)}</span>
                        <span className="text-gray-400 text-sm ml-2">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </section>

          {/* By Payment Method */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">By Payment Method</h2>
            <Card>
              <div className="divide-y divide-gray-100">
                {summary.byPaymentMethod.map((item) => (
                  <div key={item.name} className="p-3 flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Daily Spending */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Spending — {monthLabel}
            </h2>
            <Card>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {summary.dailyTotals.map((day) => {
                  const isHighest = day.total === Math.max(...summary.dailyTotals.map((d) => d.total))
                  return (
                    <div
                      key={day.date}
                      className={`p-3 flex items-center justify-between ${
                        isHighest ? 'bg-red-50' : ''
                      }`}
                    >
                      <span className="text-gray-700">
                        {new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{formatCurrency(day.total)}</span>
                        {isHighest && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            Highest
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
