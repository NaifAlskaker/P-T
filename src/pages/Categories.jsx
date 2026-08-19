import { useMemo, useRef, useState } from 'react'
import { useExpenses } from '../context/ExpenseContext'
import '../styles/Categories.css'

// ============================================================
// OWNER: feature/categories
// Categories Management Page
// ============================================================

const DEFAULT_COLOR = '#9a8c98'
const DEFAULT_ICON = '📁'

const PRESET_COLORS = [
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#f7b801',
  '#6a4c93',
  '#2ecc71',
  '#e67e22',
  '#34495e',
]

const CATEGORY_ICONS = [
  '📁',
  '🍔',
  '🚗',
  '🛒',
  '🏠',
  '💊',
  '🎮',
  '📚',
  '✈️',
  '⚽',
  '💰',
  '📱',
]

const DEFAULT_CATEGORIES = [
  {
    name: 'Food',
    icon: '🍔',
    color: '#ff6b6b',
  },
  {
    name: 'Transport',
    icon: '🚗',
    color: '#45b7d1',
  },
  {
    name: 'Shopping',
    icon: '🛒',
    color: '#f7b801',
  },
  {
    name: 'Health',
    icon: '💊',
    color: '#2ecc71',
  },
  {
    name: 'Entertainment',
    icon: '🎮',
    color: '#6a4c93',
  },
]

export default function Categories() {
  const {
    categories = [],
    expenses = [],
    addCategory,
    updateCategory,
    deleteCategory,
  } = useExpenses()

  const formRef = useRef(null)

  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [icon, setIcon] = useState(DEFAULT_ICON)

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('az')
  const [usageFilter, setUsageFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState(null)

  const isEditing = editingId !== null

  /*
   * Calculate the number of expenses for every category.
   * String conversion prevents issues if one ID is a number
   * and the other ID is a string.
   */
  const expenseCountByCategory = useMemo(() => {
    return expenses.reduce((counts, expense) => {
      const categoryId = String(expense.categoryId)

      counts[categoryId] = (counts[categoryId] || 0) + 1

      return counts
    }, {})
  }, [expenses])

  const usedCategoriesCount = useMemo(() => {
    return categories.filter((category) => {
      const categoryId = String(category.id)

      return (expenseCountByCategory[categoryId] || 0) > 0
    }).length
  }, [categories, expenseCountByCategory])

  const unusedCategoriesCount =
    categories.length - usedCategoriesCount

  const sortedCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return [...categories]
      .filter((category) => {
        const categoryName = category.name || ''

        const matchesSearch = categoryName
          .toLowerCase()
          .includes(normalizedSearch)
        const expenseCount =
          expenseCountByCategory[String(category.id)] || 0
        const matchesUsage =
          usageFilter === 'all' ||
          (usageFilter === 'used' && expenseCount > 0) ||
          (usageFilter === 'unused' && expenseCount === 0)

        return matchesSearch && matchesUsage
      })
      .sort((firstCategory, secondCategory) => {
        const firstName = firstCategory.name || ''
        const secondName = secondCategory.name || ''

        const nameComparison = firstName.localeCompare(
          secondName,
          undefined,
          {
            sensitivity: 'base',
          }
        )

        const firstCount =
          expenseCountByCategory[
            String(firstCategory.id)
          ] || 0

        const secondCount =
          expenseCountByCategory[
            String(secondCategory.id)
          ] || 0

        if (sortBy === 'az') {
          return nameComparison
        }

        if (sortBy === 'za') {
          return -nameComparison
        }

        if (sortBy === 'most-used') {
          return (
            secondCount - firstCount ||
            nameComparison
          )
        }

        if (sortBy === 'least-used') {
          return (
            firstCount - secondCount ||
            nameComparison
          )
        }

        return 0
      })
  }, [
    categories,
    search,
    sortBy,
    usageFilter,
    expenseCountByCategory,
  ])

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    })
  }

  const resetForm = () => {
    setName('')
    setColor(DEFAULT_COLOR)
    setIcon(DEFAULT_ICON)
    setEditingId(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage(null)

    const trimmedName = name.trim()

    if (!trimmedName) {
      showMessage(
        'error',
        'Please enter a category name.'
      )
      return
    }

    if (trimmedName.length < 2) {
      showMessage(
        'error',
        'Category name must contain at least 2 characters.'
      )
      return
    }

    if (trimmedName.length > 30) {
      showMessage(
        'error',
        'Category name must not exceed 30 characters.'
      )
      return
    }

    const duplicateCategory = categories.some(
      (category) => {
        const categoryName = category.name
          ?.trim()
          .toLowerCase()

        const sameName =
          categoryName === trimmedName.toLowerCase()

        const differentCategory =
          String(category.id) !== String(editingId)

        return sameName && differentCategory
      }
    )

    if (duplicateCategory) {
      showMessage(
        'error',
        'A category with this name already exists.'
      )
      return
    }

    const categoryData = {
      name: trimmedName,
      color,
      icon,
    }

    if (isEditing) {
      updateCategory(editingId, categoryData)

      showMessage(
        'success',
        `"${trimmedName}" was updated successfully.`
      )
    } else {
      addCategory(categoryData)

      showMessage(
        'success',
        `"${trimmedName}" was added successfully.`
      )
    }

    resetForm()
  }

  const handleEdit = (category) => {
    setEditingId(category.id)
    setName(category.name || '')
    setColor(category.color || DEFAULT_COLOR)
    setIcon(category.icon || DEFAULT_ICON)
    setMessage(null)

    formRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  const handleCancelEdit = () => {
    resetForm()

    showMessage(
      'info',
      'Editing was cancelled.'
    )
  }

  const handleDelete = (category) => {
    const categoryId = String(category.id)

    const expenseCount =
      expenseCountByCategory[categoryId] || 0

    if (expenseCount > 0) {
      const expenseWord =
        expenseCount === 1 ? 'expense' : 'expenses'

      showMessage(
        'error',
        `Cannot delete "${category.name}" because it is used by ${expenseCount} ${expenseWord}.`
      )

      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    )

    if (!confirmed) {
      return
    }

    deleteCategory(category.id)

    if (
      String(editingId) === String(category.id)
    ) {
      resetForm()
    }

    showMessage(
      'success',
      `"${category.name}" was deleted successfully.`
    )
  }

  const loadDefaultCategories = () => {
    const existingCategoryNames = new Set(
      categories.map((category) =>
        category.name?.trim().toLowerCase()
      )
    )

    const missingCategories =
      DEFAULT_CATEGORIES.filter((category) => {
        return !existingCategoryNames.has(
          category.name.toLowerCase()
        )
      })

    if (missingCategories.length === 0) {
      showMessage(
        'info',
        'All default categories already exist.'
      )
      return
    }

    missingCategories.forEach((category) => {
      addCategory(category)
    })

    const categoryWord =
      missingCategories.length === 1
        ? 'category was'
        : 'categories were'

    showMessage(
      'success',
      `${missingCategories.length} default ${categoryWord} added.`
    )
  }

  return (
    <div className="page categories-page">
      {/* Page header */}
      <header className="categories-header">
        <div>
          <h1 className="categories-title">
            Categories
          </h1>

          <p className="categories-subtitle">
            Create and manage your expense categories.
          </p>
        </div>

        <span className="categories-total-badge">
          {categories.length} total
        </span>
      </header>

      {/* Page messages */}
      {message && (
        <div
          role="alert"
          className={`categories-message categories-message--${message.type}`}
        >
          <span>{message.text}</span>

          <button
            type="button"
            className="categories-message-close"
            aria-label="Close message"
            onClick={() => setMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Statistics */}
      <section
        className="categories-statistics"
        aria-label="Category statistics"
      >
        <article className="card category-stat-card">
          <span className="category-stat-label">
            Total Categories
          </span>

          <strong className="category-stat-value">
            {categories.length}
          </strong>
        </article>

        <article className="card category-stat-card">
          <span className="category-stat-label">
            Total Expenses
          </span>

          <strong className="category-stat-value">
            {expenses.length}
          </strong>
        </article>

        <article className="card category-stat-card">
          <span className="category-stat-label">
            Used Categories
          </span>

          <strong className="category-stat-value">
            {usedCategoriesCount}
          </strong>
        </article>

        <article className="card category-stat-card">
          <span className="category-stat-label">
            Unused Categories
          </span>

          <strong className="category-stat-value">
            {unusedCategoriesCount}
          </strong>
        </article>
      </section>

      {/* Add or edit form */}
      <form
        ref={formRef}
        className="card category-form"
        onSubmit={handleSubmit}
      >
        <div className="category-section-heading">
          <div>
            <h2>
              {isEditing
                ? 'Edit Category'
                : 'Add New Category'}
            </h2>

            <p>
              Choose a name, icon, and color for the
              category.
            </p>
          </div>

          {isEditing && (
            <span className="category-editing-badge">
              Editing
            </span>
          )}
        </div>

        <div className="category-form-fields">
          <div className="category-field category-name-field">
            <label htmlFor="category-name">
              Category name
            </label>

            <input
              id="category-name"
              type="text"
              placeholder="Example: Food"
              value={name}
              minLength={2}
              maxLength={30}
              autoComplete="off"
              onChange={(event) =>
                setName(event.target.value)
              }
            />

            <span className="category-character-count">
              {name.length}/30 characters
            </span>
          </div>

          <div className="category-field">
            <label htmlFor="category-icon">
              Icon
            </label>

            <select
              id="category-icon"
              value={icon}
              onChange={(event) =>
                setIcon(event.target.value)
              }
            >
              {CATEGORY_ICONS.map((categoryIcon) => (
                <option
                  key={categoryIcon}
                  value={categoryIcon}
                >
                  {categoryIcon}
                </option>
              ))}
            </select>
          </div>

          <div className="category-field">
            <label htmlFor="category-color">
              Custom color
            </label>

            <input
              id="category-color"
              type="color"
              value={color}
              onChange={(event) =>
                setColor(event.target.value)
              }
            />
          </div>
        </div>

        {/* Preset colors */}
        <fieldset className="category-color-section">
          <legend>Preset colors</legend>

          <div className="category-color-list">
            {PRESET_COLORS.map((presetColor) => {
              const isSelected =
                color === presetColor

              return (
                <button
                  key={presetColor}
                  type="button"
                  className={`category-color-button ${
                    isSelected
                      ? 'category-color-button--selected'
                      : ''
                  }`}
                  style={{
                    backgroundColor: presetColor,
                  }}
                  title={`Select color ${presetColor}`}
                  aria-label={`Select color ${presetColor}`}
                  aria-pressed={isSelected}
                  onClick={() =>
                    setColor(presetColor)
                  }
                >
                  {isSelected && (
                    <span aria-hidden="true">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Category preview */}
        <div className="category-preview">
          <span className="category-preview-label">
            Preview
          </span>

          <span
            className="category-preview-badge"
            style={{
              backgroundColor: color,
            }}
          >
            {icon} {name.trim() || 'Category name'}
          </span>
        </div>

        {/* Form buttons */}
        <div className="category-form-actions">
          <button
            type="submit"
            className="category-primary-button"
          >
            {isEditing
              ? 'Update Category'
              : 'Add Category'}
          </button>

          {isEditing && (
            <button
              type="button"
              className="category-secondary-button"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Default categories */}
      <section className="card category-default-section">
        <div>
          <h2>Default Categories</h2>

          <p>
            Quickly add the common expense categories
            that are not already available.
          </p>
        </div>

        <button
          type="button"
          className="category-secondary-button"
          onClick={loadDefaultCategories}
        >
          Load Default Categories
        </button>
      </section>

      {/* Search and sorting */}
      <section
        className="card category-filter-section"
        aria-label="Search and sort categories"
      >
        <div className="category-filter-fields">
          <div className="category-search-field">
            <label
              htmlFor="category-search"
              className="category-visually-hidden"
            >
              Search categories
            </label>

            <input
              id="category-search"
              type="search"
              placeholder="Search categories..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div>
            <label
              htmlFor="category-sort"
              className="category-visually-hidden"
            >
              Sort categories
            </label>

            <select
              id="category-sort"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
            >
              <option value="az">
                Name: A-Z
              </option>

              <option value="za">
                Name: Z-A
              </option>

              <option value="most-used">
                Most used
              </option>

              <option value="least-used">
                Least used
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="category-usage-filter"
              className="category-visually-hidden"
            >
              Filter by usage
            </label>

            <select
              id="category-usage-filter"
              value={usageFilter}
              onChange={(event) =>
                setUsageFilter(event.target.value)
              }
            >
              <option value="all">All categories</option>
              <option value="used">Used only</option>
              <option value="unused">Unused only</option>
            </select>
          </div>

          {(search || usageFilter !== 'all') && (
            <button
              type="button"
              className="category-secondary-button"
              onClick={() => {
                setSearch('')
                setUsageFilter('all')
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        <p className="category-results-count">
          Showing {sortedCategories.length} of{' '}
          {categories.length} categories
        </p>
      </section>

      {/* Categories list */}
      <section
        className="card category-list-section"
        aria-label="Categories list"
      >
        <div className="category-list-heading">
          <h2>Category List</h2>

          <span>
            {sortedCategories.length}{' '}
            {sortedCategories.length === 1
              ? 'result'
              : 'results'}
          </span>
        </div>

        {sortedCategories.length === 0 ? (
          <div className="category-empty-state">
            <span
              className="category-empty-icon"
              aria-hidden="true"
            >
              📂
            </span>

            <h3>No categories found</h3>

            <p>
              {search || usageFilter !== 'all'
                ? 'No category matches the current filters.'
                : 'Add your first category to get started.'}
            </p>

            {(search || usageFilter !== 'all') && (
              <button
                type="button"
                className="category-secondary-button"
                onClick={() => {
                  setSearch('')
                  setUsageFilter('all')
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="category-list">
            {sortedCategories.map((category) => {
              const categoryId = String(category.id)

              const expenseCount =
                expenseCountByCategory[categoryId] || 0

              const isCategoryInUse =
                expenseCount > 0

              const expenseWord =
                expenseCount === 1
                  ? 'expense'
                  : 'expenses'

              return (
                <article
                  key={category.id}
                  className="category-list-item"
                  style={{
                    borderLeftColor:
                      category.color || DEFAULT_COLOR,
                  }}
                >
                  <div className="category-list-information">
                    <span
                      className="category-list-icon"
                      style={{
                        backgroundColor:
                          category.color ||
                          DEFAULT_COLOR,
                      }}
                      aria-hidden="true"
                    >
                      {category.icon || DEFAULT_ICON}
                    </span>

                    <div>
                      <h3>{category.name}</h3>

                      <p>
                        {expenseCount} {expenseWord}
                      </p>
                    </div>
                  </div>

                  <div className="category-list-actions">
                    <button
                      type="button"
                      className="category-edit-button"
                      onClick={() =>
                        handleEdit(category)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="category-delete-button"
                      disabled={isCategoryInUse}
                      title={
                        isCategoryInUse
                          ? 'Remove or reassign related expenses before deleting this category.'
                          : `Delete ${category.name}`
                      }
                      onClick={() =>
                        handleDelete(category)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}