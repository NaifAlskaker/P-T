import { useState } from 'react'
import { useExpenses } from '../context/ExpenseContext'

// ============================================================
// OWNER: feature/reports
// Goal: let the user filter expenses (by category and/or date
// range) and see totals for that filtered set. Bonus: an export
// to CSV button, or a spending-over-time chart.
//
// Already wired up for you in context:
//   expenses, categories
// ============================================================

export default function Reports() {
  const { expenses, categories } = useExpenses()
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filtered =
    categoryFilter === 'all'
      ? expenses
      : expenses.filter((e) => e.categoryId === categoryFilter)

  const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="page">
      <h1>Reports</h1>

      {/* TODO(feature/reports): add a date range filter alongside this */}
      <div className="card">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <p>Total: ${total.toFixed(2)}</p>
      </div>

      {/* TODO(feature/reports): add a CSV export button, or a chart
          showing spending trend over time */}
      <div className="card">
        {filtered.map((exp) => (
          <div key={exp.id} className="list-row">
            <span>{exp.date}</span>
            <span>{exp.title}</span>
            <span>${exp.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
