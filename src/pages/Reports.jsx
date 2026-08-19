import { useMemo, useState } from 'react'
import { useExpenses } from '../context/ExpenseContext'
import '../styles/Reports.css'

// ============================================================
// OWNER: feature/reports
// Filters expenses by category + date range, shows totals,
// a per-category breakdown chart, and a CSV export button.
// ============================================================

export default function Reports() {
  const { expenses, categories } = useExpenses()

  const [categoryFilter, setCategoryFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const categoryNameById = useMemo(() => {
    const map = new Map()
    categories.forEach((c) => map.set(c.id, c.name))
    return map
  }, [categories])

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (categoryFilter !== 'all' && e.categoryId !== categoryFilter) return false
      if (startDate && e.date < startDate) return false
      if (endDate && e.date > endDate) return false
      return true
    })
  }, [expenses, categoryFilter, startDate, endDate])

  const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0)

  // Spend grouped by category, for the bar chart
  const byCategory = useMemo(() => {
    const totals = new Map()
    filtered.forEach((e) => {
      totals.set(e.categoryId, (totals.get(e.categoryId) || 0) + Number(e.amount))
    })
    const rows = Array.from(totals.entries()).map(([id, amount]) => ({
      id,
      name: categoryNameById.get(id) || 'Uncategorized',
      amount,
    }))
    rows.sort((a, b) => b.amount - a.amount)
    return rows
  }, [filtered, categoryNameById])

  const maxCategoryAmount = byCategory.length > 0 ? byCategory[0].amount : 0

  const clearFilters = () => {
    setCategoryFilter('all')
    setStartDate('')
    setEndDate('')
  }

  const exportCSV = () => {
    const header = ['Date', 'Title', 'Category', 'Amount']
    const rows = filtered.map((e) => [
      e.date,
      `"${String(e.title).replace(/"/g, '""')}"`,
      `"${(categoryNameById.get(e.categoryId) || '').replace(/"/g, '""')}"`,
      Number(e.amount).toFixed(2),
    ])

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-report${startDate ? `_${startDate}` : ''}${
      endDate ? `_to_${endDate}` : ''
    }.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="reports-page">
      <div className="page">
        <h1>Reports</h1>

        <div className="card filters-card">
          <div className="filters-row">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <label className="inline-label">
              From
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label className="inline-label">
              To
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>

            <button type="button" className="btn-ghost" onClick={clearFilters}>
              Clear
            </button>

            <button type="button" className="btn-primary" onClick={exportCSV}>
              Export CSV
            </button>
          </div>

          <p className="total-line">
            Total: <span>${total.toFixed(2)}</span>
            <span className="muted"> &middot; {filtered.length} expense{filtered.length === 1 ? '' : 's'}</span>
          </p>
        </div>

        {byCategory.length > 0 && (
          <div className="card chart-card">
            <h2 className="card-title">Spend by category</h2>
            <div className="chart">
              {byCategory.map((row) => (
                <div key={row.id} className="chart-row">
                  <span className="chart-label">{row.name}</span>
                  <div className="chart-bar-track">
                    <div
                      className="chart-bar-fill"
                      style={{
                        width: `${maxCategoryAmount ? (row.amount / maxCategoryAmount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="chart-amount">${row.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          {filtered.length === 0 ? (
            <p className="muted empty-state">No expenses match these filters.</p>
          ) : (
            filtered.map((exp) => (
              <div key={exp.id} className="list-row">
                <span>{exp.date}</span>
                <span>{exp.title}</span>
                <span>${Number(exp.amount).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}