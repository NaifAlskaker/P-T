import { useState } from 'react'
import { useExpenses } from '../context/ExpenseContext'

// ============================================================
// OWNER: feature/categories
// Goal: let the user manage the list of expense categories —
// add a new one (with a name + color), delete one, maybe edit.
//
// Already wired up for you in context:
//   categories, addCategory, deleteCategory
//
// Careful: deleting a category that expenses still reference
// will leave those expenses "orphaned" — decide how you want
// to handle that (block delete, reassign to "Other", etc).
// ============================================================

export default function Categories() {
  const { categories, addCategory, deleteCategory } = useExpenses()
  const [name, setName] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name) return
    addCategory({ name, color: '#9a8c98' })
    setName('')
  }

  return (
    <div className="page">
      <h1>Categories</h1>

      {/* TODO(feature/categories): add a color picker instead of a fixed color */}
      <form className="card" onSubmit={handleAdd}>
        <input
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Add category</button>
      </form>

      <div className="card">
        {categories.map((cat) => (
          <div key={cat.id} className="list-row">
            <span style={{ color: cat.color }}>● {cat.name}</span>
            <button onClick={() => deleteCategory(cat.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
