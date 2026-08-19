import { useState } from 'react'
import '../styles/Account.css'
import { useExpenses } from '../context/ExpenseContext'

export default function Account() {
  const { currentUser, isLoggedIn, login, signup, logout, updateUser } = useExpenses()

  // Form states
  const [isSignup, setIsSignup] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Form inputs
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    password: currentUser?.password || '',
  })

  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  // ============ VALIDATION ============
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Valid email required'
    }
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be 6+ characters'
    }
    
    if (isSignup && !formData.name) {
      newErrors.name = 'Name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ============ LOGIN FORM ============
  const handleLogin = (e) => {
    e.preventDefault()
    setSuccess('')
    
    if (validateForm()) {
      const result = login(formData.email, formData.password)
      if (!result.success) {
        setErrors({ form: result.error })
      } else {
        setSuccess('Login successful! Welcome back.')
        setFormData({ name: '', email: '', password: '' })
        setErrors({})
        setTimeout(() => setSuccess(''), 3000)
      }
    }
  }

  // ============ SIGNUP FORM ============
  const handleSignup = (e) => {
    e.preventDefault()
    setSuccess('')
    
    if (validateForm()) {
      const result = signup(formData.name, formData.email, formData.password)
      if (!result.success) {
        setErrors({ form: result.error })
      } else {
        setSuccess('Account created successfully! You are now logged in.')
        setIsSignup(false)
        setFormData({ name: '', email: '', password: '' })
        setErrors({})
        setTimeout(() => setSuccess(''), 3000)
      }
    }
  }

  // ============ EDIT ACCOUNT ============
  const handleSaveEdit = (e) => {
    e.preventDefault()
    setSuccess('')
    
    if (formData.name && formData.email.includes('@')) {
      updateUser({
        name: formData.name,
        email: formData.email,
      })
      setIsEditing(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setErrors({ form: 'Please fill in all fields correctly' })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear errors as user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleLogout = () => {
    logout()
    setFormData({ name: '', email: '', password: '' })
    setErrors({})
    setSuccess('')
  }

  // SVG Person Icon Component
    // ============ PERSON ICON COMPONENT ============
  // Professional person silhouette - consistent across all avatars
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

  // ============ NOT LOGGED IN - LOGIN/SIGNUP FORM ============
  if (!isLoggedIn) {
    return (
      <div className="account-page">
        <h1 className="account-heading">
          {isSignup ? '📝 Create Your Account' : '🔐 Welcome Back'}
        </h1>

        {/* SUCCESS MESSAGE */}
        {success && <div className="account-success">{success}</div>}

        {/* LOGIN/SIGNUP FORM */}
        <form className="account-form" onSubmit={isSignup ? handleSignup : handleLogin}>
          {/* FORM TITLE */}
          <div className="account-form-title">
            {isSignup ? '✏️ Sign Up' : '🔑 Login'}
          </div>

          {/* NAME FIELD (SIGNUP ONLY) */}
          {isSignup && (
            <div className="account-form-group">
              <label className="account-label">
                Full Name
                <span className="account-label-hint">How you'll appear in the app</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="account-input-field"
                placeholder="John Doe"
                required={isSignup}
              />
              {errors.name && <p className="account-error">{errors.name}</p>}
            </div>
          )}

          {/* EMAIL FIELD */}
          <div className="account-form-group">
            <label className="account-label">
              Email Address
              <span className="account-label-hint">Your login email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="account-input-field"
              placeholder="you@example.com"
              required
            />
            {errors.email && <p className="account-error">{errors.email}</p>}
          </div>

          {/* PASSWORD FIELD */}
          <div className="account-form-group">
            <label className="account-label">
              Password
              <span className="account-label-hint">At least 6 characters</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="account-input-field"
              placeholder="••••••••"
              required
            />
            {errors.password && <p className="account-error">{errors.password}</p>}
          </div>

          {/* FORM ERROR */}
          {errors.form && <div className="account-error">{errors.form}</div>}

          {/* SUBMIT BUTTON */}
          <div className="account-button-group">
            <button type="submit" className="account-btn-primary">
              {isSignup ? '✓ Create Account' : '→ Login'}
            </button>
          </div>
        </form>

        {/* TOGGLE BUTTON SECTION */}
        <div className="account-toggle-section">
          <div className="account-center">
            <span className="account-toggle-text">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              className="account-link-btn"
              onClick={() => {
                setIsSignup(!isSignup)
                setErrors({})
                setFormData({ name: '', email: '', password: '' })
                setSuccess('')
              }}
            >
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============ LOGGED IN - PROFILE VIEW/EDIT ============
  return (
    <div className="account-page">
      <h1 className="account-heading">👤 My Account</h1>

      {/* SUCCESS MESSAGE */}
      {success && <div className="account-success">{success}</div>}

      {!isEditing ? (
        // ============ VIEW MODE - PROFILE CARD ============
        <div className="account-profile-card">
          {/* PROFILE HEADER WITH AVATAR */}
          <div className="account-profile-header">
            <div className="account-avatar-container">
              <div className="account-avatar">
                <PersonIcon />
              </div>
            </div>
            <div className="account-profile-info">
              <div className="account-profile-name">{currentUser.name}</div>
              <div className="account-profile-email">{currentUser.email}</div>
              <div className="account-profile-status">✓ Active</div>
            </div>
          </div>

          {/* PROFILE DIVIDER */}
          <div className="account-divider"></div>

          {/* PROFILE DETAILS */}
          <div className="account-profile-details">
            <div className="account-detail-row">
              <span className="account-detail-label">Email Address</span>
              <span className="account-detail-value">{currentUser.email}</span>
            </div>
            <div className="account-detail-row">
              <span className="account-detail-label">Account Status</span>
              <span className="account-detail-value">Active & Verified</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="account-button-group">
            <button
              className="account-btn-primary"
              onClick={() => {
                setIsEditing(true)
                setFormData({
                  name: currentUser.name,
                  email: currentUser.email,
                  password: currentUser.password,
                })
                setErrors({})
                setSuccess('')
              }}
            >
              ✏️ Edit Profile
            </button>
            <button onClick={handleLogout} className="account-btn-danger">
              🚪 Logout
            </button>
          </div>
        </div>
      ) : (
        // ============ EDIT MODE - FORM ============
        <form className="account-form" onSubmit={handleSaveEdit}>
          <div className="account-form-title">✏️ Edit Your Profile</div>

          {/* NAME FIELD */}
          <div className="account-form-group">
            <label className="account-label">
              Full Name
              <span className="account-label-hint">How you appear to others</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="account-input-field"
              placeholder="Enter your full name"
              required
            />
            {errors.name && <p className="account-error">{errors.name}</p>}
          </div>

          {/* EMAIL FIELD */}
          <div className="account-form-group">
            <label className="account-label">
              Email Address
              <span className="account-label-hint">Used for login</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="account-input-field"
              placeholder="your.email@example.com"
              required
            />
            {errors.email && <p className="account-error">{errors.email}</p>}
          </div>

          {/* FORM ERROR */}
          {errors.form && <div className="account-error">{errors.form}</div>}

          {/* ACTION BUTTONS */}
          <div className="account-button-group">
            <button type="submit" className="account-btn-primary">
              ✓ Save Changes
            </button>
            <button
              type="button"
              className="account-btn-secondary"
              onClick={() => {
                setIsEditing(false)
                setFormData({
                  name: currentUser.name,
                  email: currentUser.email,
                  password: currentUser.password,
                })
                setErrors({})
                setSuccess('')
              }}
            >
              ✕ Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}