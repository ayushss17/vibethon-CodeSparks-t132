import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import '../styles/AuthModal.css'

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { register, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    setSuccess(false)

    if (!email || !username || !password || !confirmPassword) {
      setLocalError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    const result = await register(email, username, password)
    if (result.success) {
      setSuccess(true)
      setEmail('')
      setUsername('')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        onClose()
      }, 1500)
    } else {
      setLocalError(result.error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>Create Account</h2>
        <p className="modal-subtitle">Join the AI/ML learning revolution</p>

        <form onSubmit={handleSubmit}>
          {success && (
            <div className="success-message">✓ Account created! Redirecting...</div>
          )}
          
          {(error || localError) && !success && (
            <div className="error-message">{error || localError}</div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading || success}
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              disabled={loading || success}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading || success}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading || success}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: 20 }}
            disabled={loading || success}
          >
            {loading ? 'Creating account...' : success ? '✓ Account created!' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <button 
            onClick={() => {
              onClose()
              onSwitchToLogin?.()
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
