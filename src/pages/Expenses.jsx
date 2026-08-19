import { useState } from 'react'
import { useExpenses } from '../context/ExpenseContext'
import '../styles/expense.css'

// ============================================================
// OWNER: feature/expense
// Goal: full CRUD for expenses — a form to add a new expense,
// a list of existing ones, and the ability to edit/delete each.
//
// Already wired up for you in context:
//   expenses, categories, addExpense, updateExpense, deleteExpense
// ============================================================

export default function Expenses() {
  const { expenses, categories, addExpense, updateExpense, deleteExpense } = useExpenses()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [editingId, setEditingId] = useState(null)


const handleSubmit = (e) => {
e.preventDefault()

if (!title || !amount || parseFloat(amount) <= 0) return

const expenseData = {
title,
amount: parseFloat(amount),
categoryId,
date: new Date().toISOString().slice(0, 10),
note: '',
}

if (editingId) {
updateExpense(editingId, expenseData)
setEditingId(null)
} else {
addExpense(expenseData)
}

setTitle('')
setAmount('')
}

const handleEdit = (expense) => {
  setEditingId(expense.id)
  setTitle(expense.title)
  setAmount(expense.amount)
  setCategoryId(expense.categoryId)
}

  return (
    <div className="page">
      <h1>Expenses</h1>

      {/* TODO(feature/expense): style this form, add validation,
          and support editing an existing expense (not just add/delete) */}
      <form className="card" onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
{cat.name === 'Food & Drink' && '🍔 '}
{cat.name === 'Transport' && '🚗 '}
{cat.name === 'Housing' && '🏠 '}
{cat.name === 'Entertainment' && '🎬 '}
{cat.name === 'Other' && '📦 '}
{cat.name}            </option>
          ))}
        </select>
<button type="submit">
{editingId ? 'Update expense' : 'Add expense'}
</button>
      </form>

      <div className="card">
        {expenses.map((exp) => (
          <div key={exp.id} className="expense-row">
  <span className="expense-title">{exp.title}</span>
  <span className="expense-amount">${exp.amount.toFixed(2)}</span>

  <div className="expense-actions">
    <button onClick={() => handleEdit(exp)}>Edit</button>
    <button onClick={() => deleteExpense(exp.id)}>Delete</button>
  </div>
</div>
        ))}
      </div>
    </div>
  )
}
