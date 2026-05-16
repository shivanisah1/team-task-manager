import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', members: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/projects').then((res) => setProjects(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (isAdmin) api.get('/auth/users').then((res) => setUsers(res.data));
  }, [isAdmin]);

  const handleMemberToggle = (userId) => {
    const id = userId.toString();
    setForm((f) => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter((m) => m !== id) : [...f.members, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '', members: [] });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`);
    load();
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Projects</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New Project'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && isAdmin && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">Create Project</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Team Members</label>
                <div className="d-flex flex-wrap gap-2">
                  {users.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      className={`btn btn-sm ${
                        form.members.includes(String(u._id)) ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      onClick={() => handleMemberToggle(u._id)}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-success">
                Create
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="row g-3">
        {projects.length === 0 ? (
          <p className="text-muted">No projects yet.</p>
        ) : (
          projects.map((p) => (
            <div key={p._id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text text-muted small">{p.description || 'No description'}</p>
                  <p className="small mb-1">
                    <strong>Owner:</strong> {p.createdBy?.name}
                  </p>
                  <p className="small">
                    <strong>Team:</strong>{' '}
                    {p.members?.length
                      ? p.members.map((m) => m.name).join(', ')
                      : 'No members assigned'}
                  </p>
                </div>
                {isAdmin && (
                  <div className="card-footer bg-white border-0">
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
