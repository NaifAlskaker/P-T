import { useExpenses } from '../context/ExpenseContext'

// ============================================================
// OWNER: feature/budget
// Goal: let the user set a spending limit per category, and
// show progress toward that limit (e.g. a progress bar, and a
// warning color when they're close to or over budget).
//
// Already wired up for you in context:
//   budgets, categories, spentByCategory, setBudgetForCategory
// ============================================================

export default function Budget() {
  const { budgets, categories, spentByCategory, setBudgetForCategory } = useExpenses()

  return (
    <div className="page">
      <h1>Budget</h1>

      <div className="card">
        {categories.map((cat) => {
          const budget = budgets.find((b) => b.categoryId === cat.id)
          const limit = budget?.limit ?? 0
          const spent = spentByCategory[cat.id] || 0
          // TODO(feature/budget): render this as a progress bar,
          // turn it red/orange when spent gets close to or exceeds limit
          return (
            <div key={cat.id} className="list-row">
              <span>{cat.name}</span>
              <span>${spent.toFixed(2)} / </span>
              <input
                type="number"
                value={limit}
                onChange={(e) => setBudgetForCategory(cat.id, parseFloat(e.target.value) || 0)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
