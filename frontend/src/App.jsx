import { useCallback, useEffect, useState } from 'react'
import { setUnauthorizedHandler } from './api'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import './App.css'

function App() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (!token || !user) return null
    return { token, user: JSON.parse(user) }
  })
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  const handleAuthSuccess = ({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setSession({ token, user })
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setSession(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(handleLogout)
    return () => setUnauthorizedHandler(null)
  }, [handleLogout])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const handlePointerMove = (event) => {
      document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`)
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  return (
    session ? (
      <DashboardPage
        user={session.user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />
    ) : (
      <AuthPage onAuthSuccess={handleAuthSuccess} />
    )
  )
}

export default App
