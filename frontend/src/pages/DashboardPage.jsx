import { useCallback, useEffect, useState } from 'react'
import api from '../api'
import DashboardCards from '../components/DashboardCards'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'

const defaultStats = {
  totalTasks: 0,
  byStatus: { 'To Do': 0, 'In Progress': 0, Done: 0 },
  byPriority: { Low: 0, Medium: 0, High: 0 },
}

const normalizeStats = (rawStats) => ({
  totalTasks: Number(rawStats?.totalTasks || 0),
  byStatus: {
    'To Do': Number(rawStats?.byStatus?.['To Do'] || 0),
    'In Progress': Number(rawStats?.byStatus?.['In Progress'] || 0),
    Done: Number(rawStats?.byStatus?.Done || 0),
  },
  byPriority: {
    Low: Number(rawStats?.byPriority?.Low || 0),
    Medium: Number(rawStats?.byPriority?.Medium || 0),
    High: Number(rawStats?.byPriority?.High || 0),
  },
})

function DashboardPage({ user, onLogout, theme, onToggleTheme }) {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(defaultStats)
  const [filters, setFilters] = useState({
    q: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '' })
  const [addUserLoading, setAddUserLoading] = useState(false)
  const [addUserMessage, setAddUserMessage] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const query = { ...filters, page: pagination.page, limit: pagination.limit }
      const [tasksRes, usersRes, statsRes] = await Promise.all([
        api.get('/tasks', { params: query }),
        api.get('/auth/users'),
        api.get('/dashboard/stats'),
      ])
      setTasks(tasksRes.data.tasks || [])
      setPagination((prev) => ({ ...prev, ...tasksRes.data.pagination }))
      setUsers(usersRes.data || [])
      setStats(normalizeStats(statsRes.data))
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load dashboard.')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  useEffect(() => {
    const id = setTimeout(() => fetchData(), 0)
    return () => clearTimeout(id)
  }, [fetchData])

  const createTask = async (task) => {
    try {
      await api.post('/tasks', task)
      setPagination((prev) => ({ ...prev, page: 1 }))
      await fetchData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create task.')
    }
  }

  const updateTask = async (id, payload) => {
    try {
      await api.put(`/tasks/${id}`, payload)
      await fetchData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update task.')
    }
  }

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`)
      await fetchData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete task.')
    }
  }

  const createUser = async (event) => {
    event.preventDefault()
    setAddUserLoading(true)
    setAddUserMessage('')
    try {
      await api.post('/auth/users', newUserForm)
      setNewUserForm({ name: '', email: '', password: '' })
      setAddUserMessage('User added successfully.')
      await fetchData()
    } catch (requestError) {
      setAddUserMessage(requestError.response?.data?.message || 'Failed to add user.')
    } finally {
      setAddUserLoading(false)
    }
  }

  if (loading) return <main className="app-shell">Loading dashboard...</main>

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>Smart Task Manager</h1>
          <p className="muted">Welcome, {user.name}</p>
        </div>
        <div className="topbar-actions">
          <button className="ghost" onClick={onToggleTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="ghost" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {error && <p className="error-text">{error}</p>}

      <DashboardCards stats={stats} />

      <section className="card add-user-card">
        <div className="add-user-head">
          <h2>Team Members</h2>
          <button className="ghost" onClick={() => setShowAddUser((prev) => !prev)}>
            {showAddUser ? 'Close' : 'Add User'}
          </button>
        </div>
        <p className="muted">Create users here for task assignment.</p>
        {showAddUser && (
          <form className="inline-form" onSubmit={createUser}>
            <input
              placeholder="Name"
              value={newUserForm.name}
              onChange={(event) =>
                setNewUserForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUserForm.email}
              onChange={(event) =>
                setNewUserForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
            <input
              type="password"
              placeholder="Temporary password"
              value={newUserForm.password}
              onChange={(event) =>
                setNewUserForm((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
            <button type="submit" disabled={addUserLoading}>
              {addUserLoading ? 'Adding...' : 'Create User'}
            </button>
          </form>
        )}
        {addUserMessage && <p className="muted">{addUserMessage}</p>}
      </section>

      <TaskForm users={users} onCreate={createTask} />

      <section>
        <div className="task-header">
          <h2>Your Tasks</h2>
          <div className="task-controls">
            <input
              placeholder="Search title/description"
              value={filters.q}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }))
                setFilters((prev) => ({ ...prev, q: event.target.value }))
              }}
            />
            <select
              value={filters.status}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }))
                setFilters((prev) => ({ ...prev, status: event.target.value }))
              }}
            >
              <option value="">All Status</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <select
              value={filters.priority}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }))
                setFilters((prev) => ({ ...prev, priority: event.target.value }))
              }}
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <select
              value={`${filters.sortBy}:${filters.sortOrder}`}
              onChange={(event) => {
                const [sortBy, sortOrder] = event.target.value.split(':')
                setFilters((prev) => ({ ...prev, sortBy, sortOrder }))
              }}
            >
              <option value="createdAt:desc">Newest</option>
              <option value="createdAt:asc">Oldest</option>
              <option value="title:asc">Title A-Z</option>
              <option value="title:desc">Title Z-A</option>
              <option value="priority:desc">Priority High-Low</option>
            </select>
          </div>
        </div>

        <TaskList tasks={tasks} users={users} onUpdate={updateTask} onDelete={deleteTask} />

        <div className="pagination">
          <button
            className="ghost"
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))
            }
          >
            Previous
          </button>
          <span className="muted">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} tasks)
          </span>
          <button
            className="ghost"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(prev.page + 1, prev.totalPages),
              }))
            }
          >
            Next
          </button>
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
