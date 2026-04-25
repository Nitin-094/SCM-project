import { useState } from 'react'

const defaultTask = {
  title: '',
  description: '',
  status: 'To Do',
  priority: 'Medium',
  assignedTo: '',
}

function TaskForm({ users, onCreate }) {
  const [task, setTask] = useState(defaultTask)
  const [submitting, setSubmitting] = useState(false)

  const onChange = (event) => {
    setTask((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    await onCreate(task)
    setTask(defaultTask)
    setSubmitting(false)
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Create Task</h2>
      <label>
        Title
        <input name="title" value={task.title} onChange={onChange} required />
      </label>

      <label>
        Description
        <textarea
          name="description"
          rows="3"
          value={task.description}
          onChange={onChange}
        />
      </label>

      <div className="form-grid">
        <label>
          Status
          <select name="status" value={task.status} onChange={onChange}>
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        </label>
        <label>
          Priority
          <select name="priority" value={task.priority} onChange={onChange}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
      </div>

      <label>
        Assign To
        <select name="assignedTo" value={task.assignedTo} onChange={onChange} required>
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </label>

      <button disabled={submitting} type="submit">
        {submitting ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  )
}

export default TaskForm
