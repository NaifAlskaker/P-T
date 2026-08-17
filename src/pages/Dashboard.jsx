import { useExpenses } from '../context/ExpenseContext'

// ============================================================
// OWNER: feature/dashboard
// Goal: give the user an at-a-glance view of their spending —
// total spent, spend broken down by category, maybe a simple
// bar/pie chart, and their most recent transactions.
//
// Data already available to you from context:
//   expenses, categories, budgets, totalSpent, spentByCategory
// ============================================================

export default function Dashboard() {
  const { expenses, categories, totalSpent, spentByCategory } = useExpenses()

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="card">
        <p className="muted">Total spent</p>
        <h2>${totalSpent.toFixed(2)}</h2>
      </div>

      {/* TODO(feature/dashboard): render spentByCategory as a chart,
          e.g. simple bars using the category color for each key. */}
      <div className="card">
        <p className="muted">By category</p>
        <ul>
          {categories.map((cat) => (
            <li key={cat.id}>
              {cat.name}: ${(spentByCategory[cat.id] || 0).toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      {/* TODO(feature/dashboard): show the 5 most recent expenses */}
      <div className="card">
        <p className="muted">Recent activity</p>
        <p>{expenses.length} transactions logged so far.</p>
      </div>
    </div>
  )
}
