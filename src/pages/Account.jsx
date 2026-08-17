import { useState } from 'react'
import { useExpenses } from '../context/ExpenseContext'

// ============================================================
// OWNER: feature/auth
// Goal: a login/signup screen (can be mock/local — no real backend
// needed) and a profile/settings section where the user can edit
// their name and email.
//
// Already wired up for you in context:
//   user, updateUser
//
// Note: this scaffold has no real login gate yet (the app just
// shows a "Guest User" by default) — that's part of what this
// branch should build, e.g. a simple isLoggedIn state.
// ============================================================

export default function Account() {
  const { user, updateUser } = useExpenses()
  const [name, setName] = useState(user.name)

  const handleSave = (e) => {
    e.preventDefault()
    updateUser({ name })
  }

  return (
    <div className="page">
      <h1>Account</h1>

      {/* TODO(feature/auth): build an actual login/signup form and
          gate the rest of the app behind it */}
      <form className="card" onSubmit={handleSave}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <p className="muted">{user.email}</p>
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
