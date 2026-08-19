// Shared seed data. Everyone reads from Context (see ExpenseContext.jsx),
// not from this file directly — this is just the starting state.

export const initialCategories = [
  { id: 'food', name: 'Food & Drink', color: '#e07a5f' },
  { id: 'transport', name: 'Transport', color: '#3d5a80' },
  { id: 'housing', name: 'Housing', color: '#81b29a' },
  { id: 'fun', name: 'Entertainment', color: '#f2cc8f' },
  { id: 'other', name: 'Other', color: '#9a8c98' },
]

export const initialExpenses = [
  { id: 'e1', title: 'Groceries', amount: 62.4, categoryId: 'food', date: '2026-08-02', note: '' },
  { id: 'e2', title: 'Metro card', amount: 20, categoryId: 'transport', date: '2026-08-03', note: '' },
  { id: 'e3', title: 'Rent share', amount: 450, categoryId: 'housing', date: '2026-08-01', note: '' },
  { id: 'e4', title: 'Movie night', amount: 15, categoryId: 'fun', date: '2026-08-05', note: '' },
  { id: 'e5', title: 'Coffee', amount: 4.5, categoryId: 'food', date: '2026-08-06', note: '' },
]

export const initialBudgets = [
  { categoryId: 'food', limit: 200 },
  { categoryId: 'transport', limit: 60 },
  { categoryId: 'housing', limit: 500 },
  { categoryId: 'fun', limit: 50 },
  { categoryId: 'other', limit: 40 },
]

export const initialUser = {
  name: 'Guest User',
  email: 'guest@example.com',
  password: 'password123',
}
