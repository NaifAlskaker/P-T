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

  // ---- feature/auth - Initialize from localStorage -----
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('registeredUsers')
    return saved ? JSON.parse(saved) : []
  })

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

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

  // ---- feature/auth - FIXED LOGIC -----------------------------------------------
  
  // SIGNUP: Creates new account, rejects if email already exists
  const signup = (name, email, password) => {
    // Validate inputs
    if (!name || !email || !password) {
      return { success: false, error: 'All fields required' }
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be 6+ characters' }
    }
    if (!email.includes('@')) {
      return { success: false, error: 'Valid email required' }
    }

    // Check if email already exists
    const userExists = registeredUsers.some((u) => u.email === email)
    if (userExists) {
      return { success: false, error: 'Email already registered' }
    }

    // Create new user
    const newUser = { email, password, name }
    const updatedUsers = [...registeredUsers, newUser]
    
    // Save registered users to localStorage
    setRegisteredUsers(updatedUsers)
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))

    // Auto-login after signup
    setCurrentUser(newUser)
    localStorage.setItem('currentUser', JSON.stringify(newUser))

    return { success: true, error: null }
  }

  // LOGIN: Validates email & password against registered users
  const login = (email, password) => {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'Email and password required' }
    }

    // Find user with matching email
    const user = registeredUsers.find((u) => u.email === email)

    // User doesn't exist
    if (!user) {
      return { success: false, error: "Account doesn't exist. Please signup first" }
    }

    // Password doesn't match
    if (user.password !== password) {
      return { success: false, error: 'Invalid password' }
    }

    // Login successful
    setCurrentUser(user)
    localStorage.setItem('currentUser', JSON.stringify(user))
    return { success: true, error: null }
  }

  // LOGOUT: Clears current user
  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  // UPDATE USER: Updates current user info
  const updateUser = (updates) => {
    if (!currentUser) return

    const updatedUser = { ...currentUser, ...updates }
    
    // Update current user
    setCurrentUser(updatedUser)
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))

    // Also update in registered users list
    const updatedUsers = registeredUsers.map((u) =>
      u.email === currentUser.email ? updatedUser : u
    )
    setRegisteredUsers(updatedUsers)
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))
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
    currentUser,
    isLoggedIn: !!currentUser,
    registeredUsers,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    deleteCategory,
    setBudgetForCategory,
    login,
    signup,
    logout,
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