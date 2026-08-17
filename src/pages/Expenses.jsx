import { useState } from 'react'
import { useExpenses } from '../context/ExpenseContext'

// ============================================================
// OWNER: feature/expense
// Goal: full CRUD for expenses — a form to add a new expense,
// a list of existing ones, and the ability to edit/delete each.
//
// Already wired up for you in context:
//   expenses, categories, addExpense, updateExpense, deleteExpense
// ============================================================

export default function Expenses() {
  const { expenses, categories, addExpense, deleteExpense } = useExpenses()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !amount) return
    addExpense({
      title,
      amount: parseFloat(amount),
      categoryId,
      date: new Date().toISOString().slice(0, 10),
      note: '',
    })
    setTitle('')
    setAmount('')
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
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button type="submit">Add expense</button>
      </form>

      <div className="card">
        {expenses.map((exp) => (
          <div key={exp.id} className="list-row">
            <span>{exp.title}</span>
            <span>${exp.amount.toFixed(2)}</span>
            {/* TODO(feature/expense): add an "edit" button using updateExpense */}
            <button onClick={() => deleteExpense(exp.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
