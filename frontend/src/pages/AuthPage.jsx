import { useState } from 'react'
import api from '../api'

function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login'
      const payload = isSignup
        ? form
        : { email: form.email, password: form.password }
      const { data } = await api.post(endpoint, payload)
      onAuthSuccess(data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Smart Task Manager</h1>
        <p className="muted">{isSignup ? 'Create your account' : 'Log in to continue'}</p>

        {isSignup && (
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Login'}
        </button>

        <button
          type="button"
          className="link-button"
          onClick={() => {
            setMode(isSignup ? 'login' : 'signup')
            setError('')
          }}
        >
          {isSignup
            ? 'Already have an account? Login'
            : "Don't have an account? Sign up"}
        </button>
      </form>
    </div>
  )
}

export default AuthPage
