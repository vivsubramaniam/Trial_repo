'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, Select, Textarea, Modal, EmptyState } from '@/components'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import type { Expense, ExpenseCategory, PaymentMethod, SplitDetail } from '@/lib/types'

interface SplitFormEntry {
  name: string
  percent: string
}

export default function ExpenseListPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    note: '',
    categoryId: '',
    paymentMethodId: '',
  })
  const [isSplit, setIsSplit] = useState(false)
  const [mySharePercent, setMySharePercent] = useState('100')
  const [splitEntries, setSplitEntries] = useState<SplitFormEntry[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDropdowns()
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [selectedMonth, selectedCategoryId])

  async function fetchDropdowns() {
    try {
      const [catRes, methodRes] = await Promise.all([
        fetch('/api/expense-categories'),
        fetch('/api/payment-methods'),
      ])
      const [catData, methodData] = await Promise.all([
        catRes.json(),
        methodRes.json(),
      ])
      setCategories(catData)
      setPaymentMethods(methodData)
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error)
    }
  }

  async function fetchExpenses() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedMonth) params.set('month', selectedMonth)
      if (selectedCategoryId) params.set('categoryId', selectedCategoryId)

      const res = await fetch(`/api/expenses?${params}`)
      const data = await res.json()
      setExpenses(data)
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  function resetSplitForm() {
    setIsSplit(false)
    setMySharePercent('100')
    setSplitEntries([])
  }

  function openAddModal() {
    setEditingExpense(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      note: '',
      categoryId: categories[0]?.id || '',
      paymentMethodId: paymentMethods[0]?.id || '',
    })
    resetSplitForm()
    setShowModal(true)
  }

  function openEditModal(expense: Expense) {
    setEditingExpense(expense)
    setFormData({
      date: new Date(expense.date).toISOString().split('T')[0],
      amount: String(expense.amount),
      description: expense.description,
      note: expense.note || '',
      categoryId: expense.categoryId,
      paymentMethodId: expense.paymentMethodId,
    })

    if (expense.isSplit && expense.splitDetails) {
      setIsSplit(true)
      setMySharePercent(String(expense.mySharePercent || 0))
      try {
        const details: SplitDetail[] = JSON.parse(expense.splitDetails)
        setSplitEntries(details.map((d) => ({ name: d.name, percent: String(d.percent) })))
      } catch {
        setSplitEntries([])
      }
    } else {
      resetSplitForm()
    }
    setShowModal(true)
  }

  function addSplitEntry() {
    setSplitEntries([...splitEntries, { name: '', percent: '' }])
  }

  function removeSplitEntry(index: number) {
    setSplitEntries(splitEntries.filter((_, i) => i !== index))
  }

  function updateSplitEntry(index: number, field: 'name' | 'percent', value: string) {
    const updated = [...splitEntries]
    updated[index] = { ...updated[index], [field]: value }
    setSplitEntries(updated)
  }

  function getTotalSplitPercent(): number {
    const myPct = parseFloat(mySharePercent) || 0
    const othersPct = splitEntries.reduce((sum, e) => sum + (parseFloat(e.percent) || 0), 0)
    return myPct + othersPct
  }

  async function saveExpense() {
    const amount = parseFloat(formData.amount)
    if (!formData.description.trim() || isNaN(amount) || amount <= 0) return
    if (!formData.categoryId || !formData.paymentMethodId) {
      alert('Please set up categories and payment methods in Settings first.')
      return
    }

    if (isSplit) {
      const totalPct = getTotalSplitPercent()
      if (Math.abs(totalPct - 100) > 0.1) {
        alert(`Split percentages must add up to 100%. Currently: ${totalPct}%`)
        return
      }
    }

    const splitDetails = isSplit
      ? splitEntries
          .filter((e) => e.name.trim())
          .map((e) => ({ name: e.name.trim(), percent: parseFloat(e.percent) || 0 }))
      : null

    setSaving(true)
    try {
      const payload = {
        date: formData.date,
        amount,
        description: formData.description.trim(),
        note: formData.note.trim() || null,
        categoryId: formData.categoryId,
        paymentMethodId: formData.paymentMethodId,
        isSplit,
        splitPeople: isSplit ? 1 + splitEntries.length : null,
        splitDetails,
        mySharePercent: isSplit ? parseFloat(mySharePercent) || 0 : null,
      }

      if (editingExpense) {
        await fetch(`/api/expenses/${editingExpense.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      setShowModal(false)
      fetchExpenses()
    } catch (error) {
      console.error('Failed to save expense:', error)
    } finally {
      setSaving(false)
    }
  }

  async function deleteExpense(id: string) {
    if (!confirm('Delete this expense?')) return
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      fetchExpenses()
    } catch (error) {
      console.error('Failed to delete expense:', error)
    }
  }

  function getMyShare(expense: Expense): number {
    if (!expense.isSplit || !expense.mySharePercent) return expense.amount
    return Math.round((expense.amount * expense.mySharePercent) / 100 * 100) / 100
  }

  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set())

  function toggleDate(dateKey: string) {
    setCollapsedDates((prev) => {
      const next = new Set(prev)
      if (next.has(dateKey)) next.delete(dateKey)
      else next.add(dateKey)
      return next
    })
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const myTotal = expenses.reduce((sum, e) => sum + getMyShare(e), 0)
  const hasSplits = expenses.some((e) => e.isSplit)

  // Check if any expenses logged today
  const today = new Date().toISOString().split('T')[0]
  const hasExpensesToday = expenses.some(
    (e) => new Date(e.date).toISOString().split('T')[0] === today
  )

  // Group expenses by date
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const dateKey = new Date(expense.date).toISOString().split('T')[0]
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(expense)
    return groups
  }, {} as Record<string, Expense[]>)

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a))

  function formatGroupDate(dateKey: string): string {
    const d = new Date(`${dateKey}T12:00:00`)
    const todayKey = new Date().toISOString().split('T')[0]
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterdayKey = yesterdayDate.toISOString().split('T')[0]
    if (dateKey === todayKey) return 'Today'
    if (dateKey === yesterdayKey) return 'Yesterday'
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500">Track household spending</p>
        </div>
        <Button onClick={openAddModal}>+ Add Expense</Button>
      </header>

      {/* Reminder banner */}
      {!hasExpensesToday && selectedMonth === getCurrentMonth() && !loading && (
        <Card className="mb-4">
          <div className="p-3 bg-amber-50 border-amber-200 text-amber-800 text-sm flex items-center gap-2">
            <span>💡</span>
            <span>No expenses logged today. Forgot something?</span>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <Select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          options={[
            { value: '', label: 'All Categories' },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
      </div>

      {/* Total */}
      <Card className="mb-6">
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Monthly Total</p>
            <p className="text-3xl font-bold text-primary-600">{formatCurrency(total)}</p>
          </div>
          {hasSplits && (
            <div className="text-center">
              <p className="text-sm text-gray-500">My Share</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(myTotal)}</p>
            </div>
          )}
          <div className="text-right">
            <p className="text-sm text-gray-500">Transactions</p>
            <p className="text-xl font-semibold text-gray-700">{expenses.length}</p>
          </div>
        </div>
      </Card>

      {/* Expense List — grouped by date */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : expenses.length === 0 ? (
        <EmptyState
          title="No expenses"
          description="Add your first expense to start tracking."
          icon="💰"
        />
      ) : (
        <div className="space-y-3">
          {sortedDates.map((dateKey) => {
            const dayExpenses = groupedExpenses[dateKey]
            const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0)
            const isCollapsed = collapsedDates.has(dateKey)

            return (
              <div key={dateKey}>
                {/* Date header — clickable to collapse */}
                <button
                  onClick={() => toggleDate(dateKey)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {formatGroupDate(dateKey)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {dayExpenses.length} {dayExpenses.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-800">
                      {formatCurrency(dayTotal)}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {isCollapsed ? '▶' : '▼'}
                    </span>
                  </div>
                </button>

                {/* Expense cards for this date */}
                {!isCollapsed && (
                  <div className="mt-1 space-y-2 pl-2">
                    {dayExpenses.map((expense) => {
                      let splitInfo: SplitDetail[] = []
                      if (expense.isSplit && expense.splitDetails) {
                        try { splitInfo = JSON.parse(expense.splitDetails) } catch {}
                      }

                      return (
                        <Card key={expense.id}>
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {expense.description}
                                  </h3>
                                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs flex-shrink-0">
                                    {expense.category?.name}
                                  </span>
                                  {expense.isSplit && (
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs flex-shrink-0">
                                      Split
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                  <span>{expense.paymentMethod?.name}</span>
                                  {expense.note && (
                                    <>
                                      <span>·</span>
                                      <span className="italic text-gray-400 truncate">{expense.note}</span>
                                    </>
                                  )}
                                </div>
                                {expense.isSplit && splitInfo.length > 0 && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    <span className="font-medium">Split:</span>{' '}
                                    You ({expense.mySharePercent}% = {formatCurrency(getMyShare(expense))})
                                    {splitInfo.map((s, i) => (
                                      <span key={i}>
                                        , {s.name} ({s.percent}% = {formatCurrency(Math.round(expense.amount * s.percent) / 100)})
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                  {formatCurrency(expense.amount)}
                                </span>
                                {expense.isSplit && (
                                  <span className="text-sm text-green-600 font-medium">
                                    You: {formatCurrency(getMyShare(expense))}
                                  </span>
                                )}
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => openEditModal(expense)}
                                    className="text-gray-400 hover:text-gray-600 text-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteExpense(expense.id)}
                                    className="text-gray-400 hover:text-red-500 text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Select
            label="Category"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Input
            label="Amount ($)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            min={0.01}
            step={0.01}
          />
          <Select
            label="Paid With"
            value={formData.paymentMethodId}
            onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
            options={paymentMethods.map((m) => ({ value: m.id, label: m.name }))}
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., Weekly groceries at Costco"
          />
          <Textarea
            label="Note (optional)"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="e.g., Split with roommate"
          />

          {/* Split toggle */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isSplit}
                onChange={(e) => {
                  setIsSplit(e.target.checked)
                  if (e.target.checked && splitEntries.length === 0) {
                    setSplitEntries([{ name: '', percent: '' }])
                    setMySharePercent('50')
                  }
                  if (!e.target.checked) {
                    resetSplitForm()
                  }
                }}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Split this expense</span>
            </label>
          </div>

          {isSplit && (
            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              <Input
                label="Your share (%)"
                type="number"
                value={mySharePercent}
                onChange={(e) => setMySharePercent(e.target.value)}
                min={0}
                max={100}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Others</label>
                {splitEntries.map((entry, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Name"
                        value={entry.name}
                        onChange={(e) => updateSplitEntry(i, 'name', e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        placeholder="%"
                        type="number"
                        value={entry.percent}
                        onChange={(e) => updateSplitEntry(i, 'percent', e.target.value)}
                        min={0}
                        max={100}
                      />
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeSplitEntry(i)}
                    >
                      X
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={addSplitEntry}>
                  + Add Person
                </Button>
              </div>

              {/* Percentage total indicator */}
              <div className={`text-sm font-medium ${
                Math.abs(getTotalSplitPercent() - 100) < 0.1
                  ? 'text-green-600'
                  : 'text-red-500'
              }`}>
                Total: {getTotalSplitPercent()}%
                {Math.abs(getTotalSplitPercent() - 100) >= 0.1 && ' (must be 100%)'}
              </div>

              {formData.amount && (
                <div className="text-sm text-gray-500">
                  Your share: {formatCurrency(
                    Math.round(parseFloat(formData.amount) * (parseFloat(mySharePercent) || 0)) / 100
                  )}
                  {' / '}
                  {formatCurrency(parseFloat(formData.amount) || 0)} total
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveExpense}
              disabled={saving || !formData.description.trim() || !formData.amount}
            >
              {saving ? 'Saving...' : editingExpense ? 'Save Changes' : 'Add Expense'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
