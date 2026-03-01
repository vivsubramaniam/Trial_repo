'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, Select, Textarea, Modal, EmptyState } from '@/components'
import { formatCurrency, formatDate, getCurrentMonth } from '@/lib/utils'
import type { Expense, ExpenseCategory, PaymentMethod } from '@/lib/types'

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
    setShowModal(true)
  }

  async function saveExpense() {
    const amount = parseFloat(formData.amount)
    if (!formData.description.trim() || isNaN(amount) || amount <= 0) return
    if (!formData.categoryId || !formData.paymentMethodId) {
      alert('Please set up categories and payment methods in Settings first.')
      return
    }

    setSaving(true)
    try {
      if (editingExpense) {
        await fetch(`/api/expenses/${editingExpense.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: formData.date,
            amount,
            description: formData.description.trim(),
            note: formData.note.trim() || null,
            categoryId: formData.categoryId,
            paymentMethodId: formData.paymentMethodId,
          }),
        })
      } else {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: formData.date,
            amount,
            description: formData.description.trim(),
            note: formData.note.trim() || null,
            categoryId: formData.categoryId,
            paymentMethodId: formData.paymentMethodId,
          }),
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

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  // Check if any expenses logged today
  const today = new Date().toISOString().split('T')[0]
  const hasExpensesToday = expenses.some(
    (e) => new Date(e.date).toISOString().split('T')[0] === today
  )

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
          <div className="text-right">
            <p className="text-sm text-gray-500">Transactions</p>
            <p className="text-xl font-semibold text-gray-700">{expenses.length}</p>
          </div>
        </div>
      </Card>

      {/* Expense List */}
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
          {expenses.map((expense) => (
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
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span>{formatDate(new Date(expense.date))}</span>
                      <span>·</span>
                      <span>{expense.paymentMethod?.name}</span>
                      {expense.note && (
                        <>
                          <span>·</span>
                          <span className="italic text-gray-400 truncate">{expense.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </span>
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
          ))}
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
