import { useState } from 'react'
import { useExpenses } from '../context/ExpenseContext'
import '../styles/Budget.css'

// ============================================================
// OWNER: feature/budget
// Goal: let the user set a spending limit per category, and
// show progress toward that limit.
//
// Already wired up in context:
//   budgets, categories, spentByCategory, setBudgetForCategory
// ============================================================

const getCategoryEmoji = (categoryName = '') => {
  const name = categoryName.toLowerCase()

  if (name.includes('food') || name.includes('restaurant')) return '🍔'
  if (name.includes('transport') || name.includes('car')) return '🚗'
  if (name.includes('entertainment') || name.includes('movie')) return '🎬'
  if (name.includes('housing') || name.includes('rent')) return '🏠'
  if (name.includes('education') || name.includes('school')) return '📚'
  if (name.includes('health') || name.includes('medical')) return '💊'
  if (name.includes('shopping') || name.includes('grocery')) return '🛒'
  if (name.includes('travel') || name.includes('vacation')) return '✈️'
  if (name.includes('saving')) return '💰'
  if (name.includes('bill') || name.includes('utility')) return '🧾'
  if (name.includes('subscription')) return '📱'

  return '📊'
}

const getRiskLevel = (percentage, limit) => {
  if (limit <= 0) {
    return {
      label: 'Not Set',
      icon: '⚪',
      className: 'risk-none',
      rank: 0,
    }
  }

  if (percentage < 50) {
    return {
      label: 'Safe',
      icon: '🟢',
      className: 'risk-safe',
      rank: 1,
    }
  }

  if (percentage < 80) {
    return {
      label: 'Moderate',
      icon: '🟡',
      className: 'risk-moderate',
      rank: 2,
    }
  }

  if (percentage < 100) {
    return {
      label: 'High',
      icon: '🟠',
      className: 'risk-high',
      rank: 3,
    }
  }

  if (percentage < 120) {
    return {
      label: 'Critical',
      icon: '🔴',
      className: 'risk-critical',
      rank: 4,
    }
  }

  return {
    label: 'Dangerous',
    icon: '🚨',
    className: 'risk-dangerous',
    rank: 5,
  }
}

const formatMoney = (value) => {
  return `$${Number(value || 0).toFixed(2)}`
}

export default function Budget() {
  const {
    budgets,
    categories,
    spentByCategory,
    setBudgetForCategory,
  } = useExpenses()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortOption, setSortOption] = useState('default')
  const [simulationReduction, setSimulationReduction] = useState(50)

  const [collapsedSections, setCollapsedSections] = useState({
    insights: false,
    achievements: false,
    tips: false,
  })

  const totalBudget = budgets.reduce(
    (sum, budget) => sum + Number(budget.limit || 0),
    0
  )

  const totalSpent = Object.values(spentByCategory).reduce(
    (sum, amount) => sum + Number(amount || 0),
    0
  )

  const remaining = totalBudget - totalSpent

  const budgetHealth =
    totalBudget > 0
      ? ((totalBudget - totalSpent) / totalBudget) * 100
      : 100

  const healthMeterValue = Math.max(
    0,
    Math.min(budgetHealth, 100)
  )

  const overallPercentage =
    totalBudget > 0
      ? Math.min((totalSpent / totalBudget) * 100, 100)
      : 0

  const actualOverallPercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  let overallStatus = 'safe'

  if (totalBudget > 0) {
    if (totalSpent >= totalBudget) {
      overallStatus = 'danger'
    } else if (totalSpent >= totalBudget * 0.8) {
      overallStatus = 'warning'
    }
  }

  const categoryData = categories.map((category, index) => {
    const budget = budgets.find(
      (budgetItem) => budgetItem.categoryId === category.id
    )

    const limit = Number(budget?.limit ?? 0)
    const spent = Number(spentByCategory[category.id] || 0)
    const percentage = limit > 0 ? (spent / limit) * 100 : 0

    return {
      ...category,
      originalIndex: index,
      limit,
      spent,
      percentage,
      emoji: getCategoryEmoji(category.name),
      risk: getRiskLevel(percentage, limit),
    }
  })

  const categoriesWithBudgets = categoryData.filter(
    (category) => category.limit > 0
  )

  const categoriesOnTrack = categoriesWithBudgets.filter(
    (category) => category.spent < category.limit
  )

  const categoriesOverBudget = categoriesWithBudgets.filter(
    (category) => category.spent >= category.limit
  )

  const categoriesNearLimit = categoriesWithBudgets.filter(
    (category) =>
      category.percentage >= 80 && category.percentage < 100
  )

  const categoriesWithoutBudgets = categoryData.filter(
    (category) => category.limit <= 0
  )

  const unbudgetedSpending = categoryData.filter(
    (category) => category.limit <= 0 && category.spent > 0
  )

  const highestSpendingCategory = [...categoryData].sort(
    (a, b) => b.spent - a.spent
  )[0]

  const closestToLimit = [...categoriesWithBudgets]
    .filter((category) => category.spent < category.limit)
    .sort((a, b) => b.percentage - a.percentage)[0]

  const topCategories = [...categoryData]
    .filter((category) => category.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3)

  const spendingDistribution = [...categoryData]
    .filter((category) => category.spent > 0)
    .sort((a, b) => b.spent - a.spent)

  const overallRisk = getRiskLevel(
    actualOverallPercentage,
    totalBudget
  )

  let visibleCategories = categoryData.filter((category) =>
    category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim())
  )

  if (filterStatus === 'safe') {
    visibleCategories = visibleCategories.filter(
      (category) =>
        category.limit > 0 && category.percentage < 80
    )
  }

  if (filterStatus === 'near') {
    visibleCategories = visibleCategories.filter(
      (category) =>
        category.limit > 0 &&
        category.percentage >= 80 &&
        category.percentage < 100
    )
  }

  if (filterStatus === 'over') {
    visibleCategories = visibleCategories.filter(
      (category) =>
        category.limit > 0 &&
        category.spent >= category.limit
    )
  }

  if (filterStatus === 'unset') {
    visibleCategories = visibleCategories.filter(
      (category) => category.limit <= 0
    )
  }

  visibleCategories = [...visibleCategories].sort((a, b) => {
    if (sortOption === 'spent') {
      return b.spent - a.spent
    }

    if (sortOption === 'risk') {
      return b.risk.rank - a.risk.rank
    }

    if (sortOption === 'remaining') {
      const remainingA = a.limit - a.spent
      const remainingB = b.limit - b.spent

      return remainingB - remainingA
    }

    if (sortOption === 'name') {
      return a.name.localeCompare(b.name)
    }

    return a.originalIndex - b.originalIndex
  })

  let financialStatus = {
    icon: '🟢',
    title: 'Budget On Track',
    message: 'Your spending is under control. Keep it up!',
    className: 'status-excellent',
  }

  if (totalBudget === 0) {
    financialStatus = {
      icon: '📊',
      title: 'Start Planning',
      message: 'Set category budgets to begin tracking your finances.',
      className: 'status-neutral',
    }
  } else if (totalSpent >= totalBudget) {
    financialStatus = {
      icon: '🔴',
      title: 'Budget Alert',
      message: 'You have reached or exceeded your total budget.',
      className: 'status-alert',
    }
  } else if (totalSpent >= totalBudget * 0.8) {
    financialStatus = {
      icon: '🟡',
      title: 'Be Careful',
      message: 'You are getting close to your total budget limit.',
      className: 'status-careful',
    }
  }

  let personality = {
    icon: '🧠',
    title: 'Financial Genius',
  }

  if (totalBudget === 0) {
    personality = {
      icon: '📊',
      title: 'Budget Beginner',
    }
  } else if (actualOverallPercentage > 100) {
    personality = {
      icon: '🔥',
      title: 'Overspending Machine',
    }
  } else if (actualOverallPercentage >= 85) {
    personality = {
      icon: '⚠️',
      title: 'Risk Taker',
    }
  } else if (actualOverallPercentage >= 65) {
    personality = {
      icon: '🙂',
      title: 'Balanced Budgeter',
    }
  } else if (actualOverallPercentage >= 40) {
    personality = {
      icon: '😎',
      title: 'Smart Spender',
    }
  }

  const budgetMasterProgress =
    totalBudget > 0
      ? Math.max(
          0,
          Math.min(100, 100 - Math.max(actualOverallPercentage - 100, 0))
        )
      : 0

  const superSaverProgress =
    totalBudget > 0
      ? Math.max(
          0,
          Math.min(100, (Math.max(budgetHealth, 0) / 30) * 100)
        )
      : 0

  const allCategoriesProgress =
    categoriesWithBudgets.length > 0
      ? (categoriesOnTrack.length / categoriesWithBudgets.length) * 100
      : 0

  const organizerProgress =
    categories.length > 0
      ? (categoriesWithBudgets.length / categories.length) * 100
      : 0

  const achievements = [
    {
      icon: '🏆',
      name: 'Budget Master',
      unlocked: totalBudget > 0 && totalSpent <= totalBudget,
      progress: budgetMasterProgress,
    },
    {
      icon: '💰',
      name: 'Super Saver',
      unlocked: totalBudget > 0 && budgetHealth >= 30,
      progress: superSaverProgress,
    },
    {
      icon: '🔥',
      name: 'All Categories On Track',
      unlocked:
        categoriesWithBudgets.length > 0 &&
        categoriesOverBudget.length === 0,
      progress: allCategoriesProgress,
    },
    {
      icon: '📊',
      name: 'Budget Organizer',
      unlocked:
        categories.length > 0 &&
        categoriesWithBudgets.length === categories.length,
      progress: organizerProgress,
    },
  ]

  const financialTips = []

  if (totalBudget === 0) {
    financialTips.push(
      'Set a budget for each category to receive personalized insights.'
    )
  } else {
    if (remaining > 0) {
      financialTips.push(
        `You still have ${formatMoney(
          remaining
        )} available within your budget.`
      )
    }

    if (highestSpendingCategory?.spent > 0) {
      financialTips.push(
        `${highestSpendingCategory.name} is your highest-spending category. Review it for possible savings.`
      )
    }

    if (closestToLimit) {
      financialTips.push(
        `${closestToLimit.name} is closest to its budget limit at ${closestToLimit.percentage.toFixed(
          0
        )}% used.`
      )
    }

    if (categoriesOverBudget.length > 0) {
      financialTips.push(
        `Reduce non-essential spending in ${categoriesOverBudget[0].name} to get back on track.`
      )
    } else {
      financialTips.push(
        'All funded categories are currently within their limits.'
      )
    }
  }

  let recommendedAction =
    'Continue reviewing your budget before making large purchases.'

  if (totalBudget === 0) {
    recommendedAction =
      'Set your first category budget to activate recommendations.'
  } else if (categoriesOverBudget.length > 0) {
    const category = categoriesOverBudget[0]

    recommendedAction = `Reduce ${category.name} spending by ${formatMoney(
      category.spent - category.limit
    )} to bring it back within budget.`
  } else if (unbudgetedSpending.length > 0) {
    const category = unbudgetedSpending[0]

    recommendedAction = `Set a budget for ${category.name}. It already has ${formatMoney(
      category.spent
    )} in spending.`
  } else if (closestToLimit) {
    recommendedAction = `Monitor ${closestToLimit.name}. It has used ${closestToLimit.percentage.toFixed(
      0
    )}% of its budget.`
  } else if (remaining > 0) {
    recommendedAction = `You currently have ${formatMoney(
      remaining
    )} available within your total budget.`
  }

  const simulatedReduction = Math.max(
    0,
    Number(simulationReduction || 0)
  )

  const simulatedSpent = Math.max(
    0,
    totalSpent - simulatedReduction
  )

  const simulatedRemaining = totalBudget - simulatedSpent

  const simulatedHealth =
    totalBudget > 0
      ? ((totalBudget - simulatedSpent) / totalBudget) * 100
      : 100

  const showCelebration =
    totalBudget > 0 &&
    totalSpent < totalBudget * 0.8 &&
    categoriesOverBudget.length === 0

  const toggleSection = (sectionName) => {
    if (sectionName === 'insights') {
      setCollapsedSections((current) => ({
        insights: !current.insights,
        achievements: current.achievements,
        tips: current.tips,
      }))

      return
    }

    if (sectionName === 'achievements') {
      setCollapsedSections((current) => ({
        insights: current.insights,
        achievements: !current.achievements,
        tips: current.tips,
      }))

      return
    }

    if (sectionName === 'tips') {
      setCollapsedSections((current) => ({
        insights: current.insights,
        achievements: current.achievements,
        tips: !current.tips,
      }))
    }
  }

  const updateBudget = (categoryId, value) => {
    const safeValue = Math.max(0, Number(value || 0))

    setBudgetForCategory(categoryId, safeValue)
  }

  return (
    <div className="page budget-page">
      {showCelebration && (
        <div className="budget-confetti" aria-hidden="true">
          🎉 ✨ 🎊 ⭐
        </div>
      )}

      <h1>Budget Planner</h1>

      <p className="muted">
        Manage spending limits and track progress across categories.
      </p>

      <div
        className={`financial-status-banner ${financialStatus.className}`}
      >
        <span className="financial-status-icon">
          {financialStatus.icon}
        </span>

        <div>
          <h2>{financialStatus.title}</h2>
          <p>{financialStatus.message}</p>
        </div>
      </div>

      <div className="budget-summary">
        <div className="summary-item">
          <h3>💼 Total Budget</h3>
          <p>{formatMoney(totalBudget)}</p>
        </div>

        <div className="summary-item">
          <h3>💳 Total Spent</h3>
          <p>{formatMoney(totalSpent)}</p>
        </div>

        <div className="summary-item">
          <h3>💵 Remaining</h3>

          <p className={remaining < 0 ? 'danger-text' : 'safe-text'}>
            {formatMoney(remaining)}
          </p>
        </div>

        <div className="summary-item">
          <h3>❤️ Budget Health</h3>

          <p
            className={
              budgetHealth < 0
                ? 'danger-text'
                : budgetHealth < 20
                  ? 'warning-text'
                  : 'safe-text'
            }
          >
            {budgetHealth.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="budget-activity-summary">
        <span>✅ {categoriesOnTrack.length} On Track</span>
        <span>⚠️ {categoriesNearLimit.length} Near Limit</span>
        <span>🚫 {categoriesOverBudget.length} Over Budget</span>
        <span>
          ➕ {categoriesWithoutBudgets.length} Without Budgets
        </span>
      </div>

      <div className="finance-dashboard">
        <div className="card health-meter-card">
          <div>
            <h2>Budget Health</h2>

            <p className="budget-personality">
              {personality.icon} {personality.title}
            </p>

            <span className={`risk-badge ${overallRisk.className}`}>
              {overallRisk.icon} {overallRisk.label} Risk
            </span>
          </div>

          <div
            className={`circular-meter ${overallStatus}`}
            style={{
              background: `conic-gradient(
                var(--meter-color) ${healthMeterValue * 3.6}deg,
                #e5e7eb 0deg
              )`,
            }}
          >
            <div className="circular-meter-center">
              <strong>{healthMeterValue.toFixed(0)}%</strong>
              <span>Available</span>
            </div>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <span>💵</span>

          <div>
            <h3>Remaining Available</h3>
            <p>{formatMoney(Math.max(remaining, 0))}</p>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <span>
            {highestSpendingCategory?.emoji || '📊'}
          </span>

          <div>
            <h3>Highest Spending Category</h3>
            <p>{formatMoney(highestSpendingCategory?.spent)}</p>

            <small>
              {highestSpendingCategory?.spent > 0
                ? highestSpendingCategory.name
                : 'No spending recorded'}
            </small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <span>✅</span>

          <div>
            <h3>Categories On Track</h3>

            <p>
              {categoriesOnTrack.length}/
              {categoriesWithBudgets.length}
            </p>

            <small>Funded categories below their limits</small>
          </div>
        </div>
      </div>

      <div className="overall-budget">
        <div className="overall-budget-heading">
          <h2>Overall Budget Usage</h2>

          <span className={`risk-badge ${overallRisk.className}`}>
            {overallRisk.icon} {overallRisk.label}
          </span>
        </div>

        <div className="progress-bar">
          <div
            className={`progress-fill ${overallStatus}`}
            style={{
              width: `${overallPercentage}%`,
            }}
          >
            {overallPercentage > 15 &&
              `${overallPercentage.toFixed(0)}%`}
          </div>
        </div>
      </div>

      {unbudgetedSpending.length > 0 && (
        <div className="unbudgeted-warning">
          <span>⚠️</span>

          <div>
            <strong>Unbudgeted Spending Detected</strong>

            <p>
              {unbudgetedSpending
                .map(
                  (category) =>
                    `${category.emoji} ${
                      category.name
                    }: ${formatMoney(category.spent)}`
                )
                .join(' · ')}
            </p>
          </div>
        </div>
      )}

      <div className="recommended-action">
        <span>🎯</span>

        <div>
          <h2>Recommended Action</h2>
          <p>{recommendedAction}</p>
        </div>
      </div>

      {showCelebration && (
        <div className="celebration-section">
          <span>🎉</span>

          <div>
            <h2>Congratulations!</h2>

            <p>
              Your budget is healthy and your spending is under
              control.
            </p>
          </div>
        </div>
      )}

      <div className="card spending-distribution">
        <h2>📊 Spending Distribution</h2>

        <div className="distribution-bar">
          {spendingDistribution.map((category, index) => (
            <span
              key={category.id}
              className={`distribution-segment segment-${index % 6}`}
              style={{
                width: `${
                  totalSpent > 0
                    ? (category.spent / totalSpent) * 100
                    : 0
                }%`,
              }}
              title={`${category.name}: ${formatMoney(
                category.spent
              )}`}
            />
          ))}
        </div>

        <div className="distribution-legend">
          {spendingDistribution.slice(0, 6).map((category, index) => (
            <span key={category.id}>
              <i className={`segment-${index % 6}`} />

              {category.emoji} {category.name}{' '}
              {totalSpent > 0
                ? `${(
                    (category.spent / totalSpent) *
                    100
                  ).toFixed(0)}%`
                : '0%'}
            </span>
          ))}
        </div>

        {spendingDistribution.length === 0 && (
          <p className="muted distribution-empty">
            No spending data available.
          </p>
        )}
      </div>

      <div className="card what-if-card">
        <h2>🧪 What-If Simulator</h2>

        <p className="muted">
          Preview how your totals would change if recorded spending
          was reduced. This preview does not change your saved data.
        </p>

        <div className="simulator-grid">
          <label>
            Hypothetical reduction

            <input
              type="number"
              min="0"
              value={simulationReduction}
              onChange={(event) =>
                setSimulationReduction(event.target.value)
              }
            />
          </label>

          <div>
            <span>Adjusted Spending</span>
            <strong>{formatMoney(simulatedSpent)}</strong>
          </div>

          <div>
            <span>Adjusted Remaining</span>
            <strong>{formatMoney(simulatedRemaining)}</strong>
          </div>

          <div>
            <span>Adjusted Health</span>
            <strong>{simulatedHealth.toFixed(0)}%</strong>
          </div>
        </div>
      </div>

      <div className="card smart-insights">
        <button
          type="button"
          className="collapsible-heading"
          onClick={() => toggleSection('insights')}
          aria-expanded={!collapsedSections.insights}
        >
          <span>✨ Smart Insights</span>
          <span>{collapsedSections.insights ? '＋' : '−'}</span>
        </button>

        {!collapsedSections.insights && (
          <div className="collapsible-content">
            <div className="insights-grid">
              <div>
                <span>Highest spending category</span>

                <strong>
                  {highestSpendingCategory?.spent > 0
                    ? `${highestSpendingCategory.emoji} ${highestSpendingCategory.name}`
                    : 'No spending recorded'}
                </strong>
              </div>

              <div>
                <span>Closest to budget limit</span>

                <strong>
                  {closestToLimit
                    ? `${closestToLimit.emoji} ${closestToLimit.name}`
                    : 'No active budget'}
                </strong>
              </div>

              <div>
                <span>Remaining budget</span>
                <strong>{formatMoney(remaining)}</strong>
              </div>

              <div>
                <span>Budget health</span>
                <strong>{budgetHealth.toFixed(0)}%</strong>
              </div>
            </div>

            <p className="behavioral-summary">
              {totalBudget === 0
                ? 'Set your category limits to begin analyzing your spending behavior.'
                : categoriesOverBudget.length > 0
                  ? `${categoriesOverBudget.length} ${
                      categoriesOverBudget.length === 1
                        ? 'category is'
                        : 'categories are'
                    } over budget. Focus on reducing your highest expenses.`
                  : actualOverallPercentage < 50
                    ? 'Your spending behavior is disciplined and leaves strong room within your budget.'
                    : actualOverallPercentage < 80
                      ? 'Your spending behavior is balanced. Continue monitoring categories near their limits.'
                      : 'Your spending is approaching the total limit. Try to limit non-essential purchases.'}
            </p>
          </div>
        )}
      </div>

      <div className="card top-spending-card">
        <h2>Top Spending Categories</h2>

        {topCategories.length > 0 ? (
          topCategories.map((category, index) => {
            const rankingIcons = ['👑', '🥈', '🥉']

            return (
              <p key={category.id}>
                <span className="ranking-icon">
                  {rankingIcons[index]}
                </span>{' '}
                {category.emoji} {category.name} -{' '}
                {formatMoney(category.spent)}
              </p>
            )
          })
        ) : (
          <p>No spending data available.</p>
        )}
      </div>

      <div className="card achievements-card">
        <button
          type="button"
          className="collapsible-heading"
          onClick={() => toggleSection('achievements')}
          aria-expanded={!collapsedSections.achievements}
        >
          <span>🏅 Achievements</span>
          <span>{collapsedSections.achievements ? '＋' : '−'}</span>
        </button>

        {!collapsedSections.achievements && (
          <div className="achievements-list">
            {achievements.map((achievement) => {
              const displayedProgress = Math.max(
                0,
                Math.min(achievement.progress, 100)
              )

              return (
                <div
                  key={achievement.name}
                  className={`achievement ${
                    achievement.unlocked ? 'unlocked' : 'locked'
                  }`}
                >
                  <span>
                    {achievement.unlocked
                      ? achievement.icon
                      : '🔒'}
                  </span>

                  <p>{achievement.name}</p>

                  <div className="achievement-progress">
                    <span
                      style={{
                        width: `${displayedProgress}%`,
                      }}
                    />
                  </div>

                  <small>{displayedProgress.toFixed(0)}%</small>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="card financial-tips-card">
        <button
          type="button"
          className="collapsible-heading"
          onClick={() => toggleSection('tips')}
          aria-expanded={!collapsedSections.tips}
        >
          <span>💡 Personalized Financial Tips</span>
          <span>{collapsedSections.tips ? '＋' : '−'}</span>
        </button>

        {!collapsedSections.tips && (
          <ul>
            {financialTips.map((tip, index) => (
              <li key={`${tip}-${index}`}>{tip}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="category-toolbar">
        <input
          type="search"
          value={searchTerm}
          placeholder="Search categories..."
          aria-label="Search budget categories"
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          value={filterStatus}
          aria-label="Filter budget categories"
          onChange={(event) =>
            setFilterStatus(event.target.value)
          }
        >
          <option value="all">All Categories</option>
          <option value="safe">Safe</option>
          <option value="near">Near Limit</option>
          <option value="over">Over Budget</option>
          <option value="unset">No Budget</option>
        </select>

        <select
          value={sortOption}
          aria-label="Sort budget categories"
          onChange={(event) => setSortOption(event.target.value)}
        >
          <option value="default">Default Order</option>
          <option value="spent">Highest Spending</option>
          <option value="risk">Highest Risk</option>
          <option value="remaining">Most Remaining</option>
          <option value="name">Category Name</option>
        </select>
      </div>

      <div className="card category-budget-list">
        {visibleCategories.map((category) => {
          const limit = category.limit
          const spent = category.spent
          const actualPercentage = category.percentage
          const percentage = Math.min(actualPercentage, 100)

          const suggestedBudget =
            spent > 0
              ? Math.ceil(spent * 1.1 / 10) * 10
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
              key={category.id}
              className={`budget-card budget-card-${statusClass}`}
            >
              <div className="budget-header">
                <h3>
                  <span className="category-emoji">
                    {category.emoji}
                  </span>{' '}
                  {category.name}
                </h3>

                <span>
                  {formatMoney(spent)} / {formatMoney(limit)}
                </span>
              </div>

              <div
                className={`risk-badge ${category.risk.className}`}
              >
                {category.risk.icon} {category.risk.label} Risk
              </div>

              {spent > 0 && (
                <div className="budget-recommendation">
                  <span>
                    Baseline Suggestion:{' '}
                    <strong>{formatMoney(suggestedBudget)}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateBudget(category.id, suggestedBudget)
                    }
                  >
                    Use
                  </button>
                </div>
              )}

              <input
                type="number"
                min="0"
                value={limit}
                placeholder="Set Budget"
                onChange={(event) =>
                  updateBudget(
                    category.id,
                    parseFloat(event.target.value) || 0
                  )
                }
              />

              <div className="budget-presets">
                <button
                  type="button"
                  onClick={() =>
                    updateBudget(category.id, limit + 50)
                  }
                >
                  +$50
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateBudget(category.id, limit + 100)
                  }
                >
                  +$100
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateBudget(category.id, spent)
                  }
                >
                  Copy Spent
                </button>

                <button
                  type="button"
                  onClick={() => updateBudget(category.id, 0)}
                >
                  Reset
                </button>
              </div>

              <div className="progress-bar">
                <div
                  className={`progress-fill ${statusClass}`}
                  style={{
                    width: `${percentage}%`,
                  }}
                >
                  {percentage > 15 &&
                    `${percentage.toFixed(0)}%`}
                </div>
              </div>

              <p className="percentage-text">
                {percentage.toFixed(0)}% Used
              </p>

              <p
                className={
                  spent > limit && limit > 0
                    ? 'danger-text'
                    : 'safe-text'
                }
              >
                {limit > 0
                  ? spent > limit
                    ? `Over Budget: ${formatMoney(spent - limit)}`
                    : `Remaining: ${formatMoney(
                        limit - spent
                      )} (${(
                        ((limit - spent) / limit) *
                        100
                      ).toFixed(0)}%)`
                  : 'No Budget Set'}
              </p>

              {limit > 0 && spent < limit * 0.5 && (
                <p className="safe-text">
                  ✅ Spending is well under control
                </p>
              )}

              {limit > 0 &&
                spent >= limit * 0.5 &&
                spent < limit * 0.8 && (
                  <p className="percentage-text">
                    👍 Budget usage is healthy
                  </p>
                )}

              {statusClass === 'warning' && (
                <p className="warning-text">
                  ⚠ Near Budget Limit
                </p>
              )}

              {statusClass === 'danger' && (
                <p className="danger-text">
                  🚫 Budget Exceeded
                </p>
              )}
            </div>
          )
        })}

        {visibleCategories.length === 0 && (
          <p className="no-category-results">
            No categories match your current search or filter.
          </p>
        )}
      </div>
    </div>
  )
}