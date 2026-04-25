import { useState } from 'react'

function TaskList({ tasks, users, onUpdate, onDelete }) {
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [draft, setDraft] = useState(null)

  const startEdit = (task) => {
    setEditingTaskId(task._id)
    setDraft({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo?._id,
    })
  }

  const saveEdit = async (taskId) => {
    await onUpdate(taskId, draft)
    setEditingTaskId(null)
    setDraft(null)
  }

  if (!tasks.length) {
    return <p className="muted">No tasks found for these filters.</p>
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article className="card task-card" key={task._id}>
          {editingTaskId === task._id ? (
            <>
              <input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              />
              <textarea
                rows="2"
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
              <div className="form-grid">
                <select
                  value={draft.status}
                  onChange={(event) => setDraft({ ...draft, status: event.target.value })}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
                <select
                  value={draft.priority}
                  onChange={(event) => setDraft({ ...draft, priority: event.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <select
                value={draft.assignedTo}
                onChange={(event) => setDraft({ ...draft, assignedTo: event.target.value })}
              >
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <div className="inline-actions">
                <button onClick={() => saveEdit(task._id)} type="button">
                  Save
                </button>
                <button className="ghost" onClick={() => setEditingTaskId(null)} type="button">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h3>{task.title}</h3>
              <p>{task.description || 'No description.'}</p>
              <p>
                <strong>Status:</strong> {task.status}
              </p>
              <p>
                <strong>Priority:</strong> {task.priority}
              </p>
              <p>
                <strong>Assigned To:</strong> {task.assignedTo?.name || 'Unknown'}
              </p>
              <div className="inline-actions">
                <button onClick={() => startEdit(task)} type="button">
                  Edit
                </button>
                <button className="danger" onClick={() => onDelete(task._id)} type="button">
                  Delete
                </button>
              </div>
            </>
          )}
        </article>
      ))}
    </div>
  )
}

export default TaskList
