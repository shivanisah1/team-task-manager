import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusOptions = ['todo', 'in_progress', 'done'];
const priorityOptions = ['low', 'medium', 'high'];

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterProject, setFilterProject] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTasks = () => {
    const params = filterProject ? { projectId: filterProject } : {};
    api.get('/tasks', { params }).then((res) => setTasks(res.data));
  };

  useEffect(() => {
    Promise.all([
      api.get('/projects'),
      api.get('/auth/users'),
    ]).then(([pRes, uRes]) => {
      setProjects(pRes.data);
      setUsers(uRes.data);
      if (pRes.data.length && !form.project) {
        setForm((f) => ({ ...f, project: pRes.data[0]._id }));
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) loadTasks();
  }, [filterProject, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tasks', {
        ...form,
        dueDate: form.dueDate || undefined,
        assignedTo: form.assignedTo || undefined,
      });
      setForm({
        title: '',
        description: '',
        project: projects[0]?._id || '',
        assignedTo: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
      });
      setShowForm(false);
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const updateStatus = async (task, status) => {
    await api.put(`/tasks/${task._id}`, { status });
    loadTasks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    loadTasks();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h3 mb-0">Tasks</h1>
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New Task'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">Create Task</h5>
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Project</label>
                <select
                  className="form-select"
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                  required
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Assign To</label>
                <select
                  className="form-select"
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-success">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-responsive card shadow-sm">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Project</th>
              <th>Assigned</th>
              <th>Priority</th>
              <th>Due</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  No tasks found
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t._id}>
                  <td>
                    <strong>{t.title}</strong>
                    {t.description && (
                      <div className="small text-muted">{t.description}</div>
                    )}
                  </td>
                  <td>{t.project?.name}</td>
                  <td>{t.assignedTo?.name || '—'}</td>
                  <td>
                    <span className="badge bg-secondary">{t.priority}</span>
                  </td>
                  <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={t.status}
                      onChange={(e) => updateStatus(t, e.target.value)}
                      disabled={
                        user.role === 'member' &&
                        String(t.assignedTo?._id) !== String(user.id)
                      }
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(t._id)}
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
