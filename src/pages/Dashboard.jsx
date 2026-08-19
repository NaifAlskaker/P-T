import { useMemo } from 'react'
import { useExpenses } from '../context/ExpenseContext'

export default function Dashboard() {
  const {
    expenses,
    categories,
    budgets,
    totalSpent,
    spentByCategory,
  } = useExpenses()

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  }, [expenses])

  const usedCategories = useMemo(() => {
    return categories.filter(
      (category) => (spentByCategory[category.id] || 0) > 0
    )
  }, [categories, spentByCategory])

  const topCategory = useMemo(() => {
    if (usedCategories.length === 0) return null

    return usedCategories.reduce((top, category) => {
      const currentAmount = spentByCategory[category.id] || 0
      const topAmount = spentByCategory[top.id] || 0

      return currentAmount > topAmount ? category : top
    }, usedCategories[0])
  }, [usedCategories, spentByCategory])

  const totalBudget = useMemo(() => {
    return budgets.reduce(
      (sum, budget) => sum + Number(budget.limit || 0),
      0
    )
  }, [budgets])

  const budgetPercentage =
    totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0

  const remainingBudget = Math.max(totalBudget - totalSpent, 0)

  const chartBackground = useMemo(() => {
    if (totalSpent <= 0) {
      return 'conic-gradient(#e8edf4 0deg 360deg)'
    }

    let currentDegree = 0

    const segments = categories.map((category) => {
      const amount = spentByCategory[category.id] || 0
      const categoryDegrees = (amount / totalSpent) * 360
      const startDegree = currentDegree
      const endDegree = currentDegree + categoryDegrees

      currentDegree = endDegree

      return `${category.color} ${startDegree}deg ${endDegree}deg`
    })

    return `conic-gradient(${segments.join(', ')})`
  }, [categories, spentByCategory, totalSpent])

  const getCategory = (categoryId) => {
    return categories.find((category) => category.id === categoryId)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount) || 0)
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(`${date}T00:00:00`))
  }

  return (
    <div className="page dashboard-page">
      <section className="dashboard-welcome">
        <div className="welcome-circle welcome-circle-one" />
        <div className="welcome-circle welcome-circle-two" />

        <div className="welcome-content">
          <span className="welcome-label">
            <span className="welcome-spark">✦</span>
            Financial overview
          </span>

          <h1>Welcome to Pocket</h1>

          <p>
            Track your expenses, understand your habits, and stay in
            control of your money.
          </p>
        </div>

        <div className="welcome-balance">
          <div className="welcome-wallet">P</div>

          <div>
            <span>Total spending</span>
            <strong>{formatCurrency(totalSpent)}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-statistics">
        <article className="stat-card stat-card-blue">
          <div className="stat-card-top">
            <div className="stat-icon">$</div>
            <span className="stat-badge">This month</span>
          </div>

          <p>Total spent</p>
          <h2>{formatCurrency(totalSpent)}</h2>
          <span className="stat-description">
            Across all categories
          </span>
        </article>

        <article className="stat-card stat-card-purple">
          <div className="stat-card-top">
            <div className="stat-icon">#</div>
            <span className="stat-badge">
              {recentExpenses.length} recent
            </span>
          </div>

          <p>Transactions</p>
          <h2>{expenses.length}</h2>
          <span className="stat-description">
            Total expenses recorded
          </span>
        </article>

        <article className="stat-card stat-card-orange">
          <div className="stat-card-top">
            <div className="stat-icon">◈</div>
            <span className="stat-badge">
              {topCategory ? `Top: ${topCategory.name}` : 'No activity'}
            </span>
          </div>

          <p>Categories used</p>
          <h2>{usedCategories.length}</h2>
          <span className="stat-description">
            Out of {categories.length} categories
          </span>
        </article>
      </section>

      <section className="dashboard-budget-card">
        <div className="budget-information">
          <div className="budget-icon">◎</div>

          <div>
            <span>Monthly budget status</span>
            <strong>
              {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
            </strong>
          </div>
        </div>

        <div className="budget-progress-area">
          <div className="budget-numbers">
            <span>{budgetPercentage.toFixed(0)}% used</span>
            <strong>{formatCurrency(remainingBudget)} remaining</strong>
          </div>

          <div className="budget-progress">
            <div
              className={
                budgetPercentage >= 90
                  ? 'budget-progress-value budget-danger'
                  : budgetPercentage >= 70
                    ? 'budget-progress-value budget-warning'
                    : 'budget-progress-value'
              }
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
        </div>
      </section>

      <section className="dashboard-content">
        <article className="card dashboard-analysis">
          <div className="dashboard-card-heading">
            <div>
              <span className="dashboard-section-label">
                Analytics
              </span>
              <h2>Spending distribution</h2>
              <p className="muted">
                See how your expenses are divided.
              </p>
            </div>

            <span className="month-pill">This month</span>
          </div>

          {expenses.length === 0 ? (
            <div className="dashboard-empty">
              <span>◎</span>
              <p>No spending data is available.</p>
            </div>
          ) : (
            <div className="analysis-content">
              <div className="donut-section">
                <div
                  className="donut-chart"
                  style={{ background: chartBackground }}
                  role="img"
                  aria-label="Spending distribution by category"
                >
                  <div className="donut-center">
                    <span>Total spent</span>
                    <strong>{formatCurrency(totalSpent)}</strong>
                  </div>
                </div>

                {topCategory && (
                  <div className="top-category">
                    <span>Highest spending</span>
                    <strong>{topCategory.name}</strong>
                  </div>
                )}
              </div>

              <div className="dashboard-category-list">
                {categories.map((category) => {
                  const amount = spentByCategory[category.id] || 0

                  const percentage =
                    totalSpent > 0 ? (amount / totalSpent) * 100 : 0

                  return (
                    <div
                      className="dashboard-category"
                      key={category.id}
                    >
                      <div className="category-heading">
                        <div className="category-name">
                          <span
                            className="category-dot"
                            style={{
                              backgroundColor: category.color,
                            }}
                          />

                          <span>{category.name}</span>
                        </div>

                        <strong>{formatCurrency(amount)}</strong>
                      </div>

                      <div
                        className="category-progress"
                        role="progressbar"
                        aria-label={`${category.name} spending`}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={Math.round(percentage)}
                      >
                        <div
                          className="category-progress-value"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>

                      <span className="category-percentage">
                        {percentage.toFixed(1)}% of total spending
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </article>

        <article className="card dashboard-activity">
          <div className="dashboard-card-heading">
            <div>
              <span className="dashboard-section-label">
                Activity
              </span>
              <h2>Recent transactions</h2>
              <p className="muted">
                Your five latest expenses.
              </p>
            </div>

            <span className="transaction-count">
              {recentExpenses.length}
            </span>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="dashboard-empty">
              <span>▤</span>
              <p>No expenses have been added yet.</p>
            </div>
          ) : (
            <div className="transaction-list">
              {recentExpenses.map((expense) => {
                const category = getCategory(expense.categoryId)

                return (
                  <div className="transaction-item" key={expense.id}>
                    <div
                      className="transaction-icon"
                      style={{
                        color: category?.color || '#64748b',
                        backgroundColor:
                          `${category?.color || '#64748b'}18`,
                      }}
                    >
                      {category?.name?.charAt(0) || '?'}
                    </div>

                    <div className="transaction-details">
                      <strong>{expense.title}</strong>

                      <span>
                        {category?.name || 'Uncategorized'} ·{' '}
                        {formatDate(expense.date)}
                      </span>
                    </div>

                    <div className="transaction-amount">
                      <strong>
                        -{formatCurrency(expense.amount)}
                      </strong>
                      <span>Expense ↗</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </article>
      </section>
    </div>
  )
}