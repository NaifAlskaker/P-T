import { NavLink, useNavigate } from 'react-router-dom'
import { useExpenses } from '../context/ExpenseContext'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/expenses', label: 'Expenses' },
  { to: '/categories', label: 'Categories' },
  { to: '/budget', label: 'Budget' },
  { to: '/reports', label: 'Reports' },
]

export default function Navbar() {
  const { currentUser, isLoggedIn } = useExpenses()
  const navigate = useNavigate()

  // ============ PERSON ICON COMPONENT ============
  // Same professional person silhouette as Account page
    // ============ PERSON ICON COMPONENT ============
  // Same professional person silhouette as Account page
  const PersonIcon = () => (
    <svg 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="currentColor"
      stroke="none"
    >
      {/* Head */}
      <circle cx="12" cy="7" r="4.5" />
      {/* Body/Torso */}
      <path d="M 4 13 C 4 11 7.5 10 12 10 C 16.5 10 20 11 20 13 L 20 23 L 4 23 Z" />
    </svg>
  )

  return (
    <nav className="navbar">
      <div className="navbar-brand">Pocket</div>
      <div className="navbar-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Avatar Section - ALWAYS SHOW (logged in or not) */}
      <div
        className="account-user-section"
        onClick={() => navigate('/account')}
        title={isLoggedIn ? 'Account' : 'Signup / Login'}
      >
        <div className="account-avatar">
          <PersonIcon />
        </div>
        <span className="account-user-name">
          {isLoggedIn ? currentUser.name : 'Signup/Login'}
        </span>
      </div>
    </nav>
  )
}