import { useExpenses } from '../context/ExpenseContext'
import '../styles/Budget.css'
// ============================================================
// OWNER: feature/dashboard
// Goal: give the user an at-a-glance view of their spending —
// total spent, spend broken down by category, maybe a simple
// bar/pie chart, and their most recent transactions.
//
// Data already available to you from context:
//   expenses, categories, budgets, totalSpent, spentByCategory
// ============================================================

export default function Budget() {
  const {
    budgets,
    categories,
    spentByCategory,
    setBudgetForCategory,
  } = useExpenses()

  return (
    <div className="page">
      <h1>Budget</h1>

      <div className="card">
        {categories.map((cat) => {
          const budget = budgets.find(
            (b) => b.categoryId === cat.id
          )

          const limit = budget?.limit ?? 0
          const spent = spentByCategory[cat.id] || 0

          const percentage =
            limit > 0
              ? Math.min((spent / limit) * 100, 100)
              : 0

          let statusClass = 'safe'

          if (limit > 0) {
            if (spent >= limit) {
              statusClass = 'danger'
            } else if (spent >= limit * 0.8) {
              statusClass = 'warning'
            }
          }

          return (
            <div
              key={cat.id}
              className="budget-card"
            >
              <div className="budget-header">
                <h3>{cat.name}</h3>

                <span>
                  ${spent.toFixed(2)} / ${limit.toFixed(2)}
                </span>
              </div>

              <input
                type="number"
                min="0"
                value={limit}
                placeholder="Set budget"
                onChange={(e) =>
                  setBudgetForCategory(
                    cat.id,
                    parseFloat(e.target.value) || 0
                  )
                }
              />

              <div className="progress-bar">
                <div
                  className={`progress-fill ${statusClass}`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>

              {statusClass === 'warning' && (
                <p className="warning-text">
                  Close to budget limit
                </p>
              )}

              {statusClass === 'danger' && (
                <p className="danger-text">
                  Budget exceeded
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}