import { createContext, useContext, useMemo, useState } from 'react'
import {
  initialExpenses,
  initialCategories,
  initialBudgets,
  initialUser,
} from '../data/mockData'

// ---------------------------------------------------------------------------
// THIS FILE IS SHARED BY EVERYONE. Do not restructure the state shape without
// telling the whole team first — every feature branch reads from here.
// Each branch should only ADD functions it needs, not remove/rename existing
// ones other people depend on.
// ---------------------------------------------------------------------------

const ExpenseContext = createContext(null)

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [categories, setCategories] = useState(initialCategories)
  const [budgets, setBudgets] = useState(initialBudgets)
  const [user, setUser] = useState(initialUser)

  // ---- feature/expense -----------------------------------------------
  const addExpense = (expense) => {
    setExpenses((prev) => [
      ...prev,
      { ...expense, id: `e${Date.now()}` },
    ])
  }

  const updateExpense = (id, updates) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp))
    )
  }

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id))
  }

  // ---- feature/categories ----------------------------------------------
  const addCategory = (category) => {
    setCategories((prev) => [
      ...prev,
      { ...category, id: category.id || category.name.toLowerCase().replace(/\s+/g, '-') },
    ])
  }

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
  }

  // ---- feature/budget ----------------------------------------------------
  const setBudgetForCategory = (categoryId, limit) => {
    setBudgets((prev) => {
      const exists = prev.some((b) => b.categoryId === categoryId)
      if (exists) {
        return prev.map((b) => (b.categoryId === categoryId ? { ...b, limit } : b))
      }
      return [...prev, { categoryId, limit }]
    })
  }

  // ---- feature/auth --------------------------------------------------
  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }))
  }

  // ---- shared helpers (used by dashboard + reports) ----------------------
  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  )

  const spentByCategory = useMemo(() => {
    const map = {}
    for (const cat of categories) map[cat.id] = 0
    for (const exp of expenses) {
      map[exp.categoryId] = (map[exp.categoryId] || 0) + Number(exp.amount)
    }
    return map
  }, [expenses, categories])

  const value = {
    expenses,
    categories,
    budgets,
    user,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    deleteCategory,
    setBudgetForCategory,
    updateUser,
    totalSpent,
    spentByCategory,
  }

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  )
}

// Import this hook wherever you need the shared data:
// const { expenses, addExpense } = useExpenses()
export function useExpenses() {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('useExpenses must be used inside <ExpenseProvider>')
  return ctx
}
