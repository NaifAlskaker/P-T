import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/expenses', label: 'Expenses' },
  { to: '/categories', label: 'Categories' },
  { to: '/budget', label: 'Budget' },
  { to: '/reports', label: 'Reports' },
  { to: '/account', label: 'Account' },
]

export default function Navbar() {
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
    </nav>
  )
}
