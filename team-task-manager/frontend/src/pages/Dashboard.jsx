import { useEffect, useState } from 'react';
import api from '../services/api';

const statusBadge = {
  todo: 'secondary',
  in_progress: 'primary',
  done: 'success',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard'));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  const { summary, recentTasks, overdueTasks } = data;

  return (
    <div>
      <h1 className="h3 mb-4">Dashboard</h1>
      <div className="row g-3 mb-4">
        <StatCard label="Total Tasks" value={summary.total} />
        <StatCard label="To Do" value={summary.todo} />
        <StatCard label="In Progress" value={summary.inProgress} valueClass="text-primary" />
        <StatCard label="Done" value={summary.done} valueClass="text-success" cardClass="success" />
        <StatCard label="Overdue" value={summary.overdue} valueClass="text-danger" cardClass="danger" />
        <StatCard label="My Tasks" value={summary.myTasks} cardClass="warning" />
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white fw-semibold">Recent Tasks</div>
            <ul className="list-group list-group-flush">
              {recentTasks.length === 0 ? (
                <li className="list-group-item text-muted">No tasks yet</li>
              ) : (
                recentTasks.map((t) => (
                  <li key={t._id} className="list-group-item d-flex justify-content-between">
                    <span>
                      <strong>{t.title}</strong>
                      <br />
                      <small className="text-muted">{t.project?.name}</small>
                    </span>
                    <span className={`badge bg-${statusBadge[t.status]}`}>{t.status}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm border-danger">
            <div className="card-header bg-white fw-semibold text-danger">Overdue Tasks</div>
            <ul className="list-group list-group-flush">
              {overdueTasks.length === 0 ? (
                <li className="list-group-item text-muted">No overdue tasks</li>
              ) : (
                overdueTasks.map((t) => (
                  <li key={t._id} className="list-group-item">
                    <strong>{t.title}</strong>
                    <br />
                    <small>
                      {t.project?.name} · Due {new Date(t.dueDate).toLocaleDateString()}
                    </small>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, valueClass = '', cardClass = '' }) {
  return (
    <div className="col-6 col-md-4 col-lg-2">
      <div className={`card stat-card ${cardClass} shadow-sm h-100`}>
        <div className="card-body">
          <div className="text-muted small">{label}</div>
          <div className={`h4 mb-0 ${valueClass}`}>{value}</div>
        </div>
      </div>
    </div>
  );
}

