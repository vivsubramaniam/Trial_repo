'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, Modal, EmptyState } from '@/components'
import type { ExpenseCategory, PaymentMethod } from '@/lib/types'

export default function ExpenseSettingsPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null)
  const [categoryName, setCategoryName] = useState('')

  const [showMethodModal, setShowMethodModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [methodName, setMethodName] = useState('')

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
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
      console.error('Failed to fetch settings data:', error)
    } finally {
      setLoading(false)
    }
  }

  function openAddCategory() {
    setEditingCategory(null)
    setCategoryName('')
    setShowCategoryModal(true)
  }

  function openEditCategory(cat: ExpenseCategory) {
    setEditingCategory(cat)
    setCategoryName(cat.name)
    setShowCategoryModal(true)
  }

  async function saveCategory() {
    if (!categoryName.trim()) return
    setSaving(true)
    try {
      if (editingCategory) {
        await fetch(`/api/expense-categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryName.trim() }),
        })
      } else {
        await fetch('/api/expense-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryName.trim() }),
        })
      }
      setShowCategoryModal(false)
      fetchData()
    } catch (error) {
      console.error('Failed to save category:', error)
    } finally {
      setSaving(false)
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category? Existing expenses will keep it, but it won\'t appear in dropdowns.')) return
    try {
      await fetch(`/api/expense-categories/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

  function openAddMethod() {
    setEditingMethod(null)
    setMethodName('')
    setShowMethodModal(true)
  }

  function openEditMethod(method: PaymentMethod) {
    setEditingMethod(method)
    setMethodName(method.name)
    setShowMethodModal(true)
  }

  async function saveMethod() {
    if (!methodName.trim()) return
    setSaving(true)
    try {
      if (editingMethod) {
        await fetch(`/api/payment-methods/${editingMethod.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: methodName.trim() }),
        })
      } else {
        await fetch('/api/payment-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: methodName.trim() }),
        })
      }
      setShowMethodModal(false)
      fetchData()
    } catch (error) {
      console.error('Failed to save payment method:', error)
    } finally {
      setSaving(false)
    }
  }

  async function deleteMethod(id: string) {
    if (!confirm('Delete this payment method? Existing expenses will keep it, but it won\'t appear in dropdowns.')) return
    try {
      await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete payment method:', error)
    }
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Expense Settings</h1>
        <p className="text-gray-500">Manage categories and payment methods</p>
      </header>

      {/* Categories Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <Button size="sm" onClick={openAddCategory}>+ Add Category</Button>
        </div>

        {categories.length === 0 ? (
          <EmptyState
            title="No categories"
            description="Add expense categories to get started."
            icon="📂"
          />
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <Card key={cat.id}>
                <div className="p-3 flex items-center justify-between">
                  <span className="font-medium text-gray-900">{cat.name}</span>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEditCategory(cat)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteCategory(cat.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Payment Methods Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
          <Button size="sm" onClick={openAddMethod}>+ Add Method</Button>
        </div>

        {paymentMethods.length === 0 ? (
          <EmptyState
            title="No payment methods"
            description="Add your cards and accounts (e.g., 'John Credit', 'Jane Debit')."
            icon="💳"
          />
        ) : (
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <div className="p-3 flex items-center justify-between">
                  <span className="font-medium text-gray-900">{method.name}</span>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEditMethod(method)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteMethod(method.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g., Groceries"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveCategory} disabled={saving || !categoryName.trim()}>
              {saving ? 'Saving...' : editingCategory ? 'Save' : 'Add'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Method Modal */}
      <Modal
        isOpen={showMethodModal}
        onClose={() => setShowMethodModal(false)}
        title={editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
      >
        <div className="space-y-4">
          <Input
            label="Payment Method Name"
            value={methodName}
            onChange={(e) => setMethodName(e.target.value)}
            placeholder="e.g., John Credit Card"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowMethodModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveMethod} disabled={saving || !methodName.trim()}>
              {saving ? 'Saving...' : editingMethod ? 'Save' : 'Add'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
