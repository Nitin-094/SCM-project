const statusItems = [
  { label: 'To Do', key: 'To Do' },
  { label: 'In Progress', key: 'In Progress' },
  { label: 'Done', key: 'Done' },
]

const priorityItems = [
  { label: 'Low', key: 'Low' },
  { label: 'Medium', key: 'Medium' },
  { label: 'High', key: 'High' },
]

function DashboardCards({ stats }) {
  const total = Number(stats?.totalTasks || 0)

  return (
    <section className="stats-grid">
      <article className="card stat-card">
        <h3>Total Tasks</h3>
        <p className="stat-value">{total}</p>
      </article>

      <article className="card stat-card">
        <h3>By Status</h3>
        {statusItems.map((item) => {
          const count = Number(stats?.byStatus?.[item.key] || 0)
          const width = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={item.key} className="metric-row">
              <div className="metric-head">
                <span>{item.label}</span>
                <strong>{count}</strong>
              </div>
              <div className="meter">
                <span style={{ width: `${width}%` }} />
              </div>
            </div>
          )
        })}
      </article>

      <article className="card stat-card">
        <h3>By Priority</h3>
        {priorityItems.map((item) => {
          const count = Number(stats?.byPriority?.[item.key] || 0)
          const width = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={item.key} className="metric-row">
              <div className="metric-head">
                <span>{item.label}</span>
                <strong>{count}</strong>
              </div>
              <div className="meter">
                <span style={{ width: `${width}%` }} />
              </div>
            </div>
          )
        })}
      </article>
    </section>
  )
}

export default DashboardCards
