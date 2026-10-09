import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { ROLE_LABEL } from '../auth.jsx';
import { useToast } from '../components/Toasts.jsx';

const ROLE_HELP = {
  STAFF: 'Can view workshops and register or cancel attendees.',
  MANAGER: 'Everything front desk can do, plus add and edit workshops.',
  ADMIN: 'Manages accounts only. Cannot see workshops or registrations.',
};

function CreateAccount({ onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const created = await api.createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      toast(`Created an account for ${created.name}.`);
      setForm({ name: '', email: '', password: '', role: form.role });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel" aria-labelledby="create-h">
      <h2 id="create-h">Create an account</h2>
      <form onSubmit={submit} className="stack">
        <label className="field">
          <span>Full name</span>
          <input required maxLength={100} value={form.name} onChange={set('name')} autoComplete="off" />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" required maxLength={190} value={form.email} onChange={set('email')} autoComplete="off" />
        </label>
        <label className="field">
          <span>Starting password</span>
          <div className="input-row">
            <input
              type={show ? 'text' : 'password'} required minLength={8} maxLength={72}
              value={form.password} onChange={set('password')} autoComplete="new-password"
            />
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setShow((s) => !s)}>
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
          <small>At least 8 characters. Share it with them in person.</small>
        </label>
        <label className="field">
          <span>Role</span>
          <select value={form.role} onChange={set('role')}>
            {['STAFF', 'MANAGER', 'ADMIN'].map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </select>
          <small>{ROLE_HELP[form.role]}</small>
        </label>
        {error && <p className="alert alert-error" role="alert">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </section>
  );
}

export default function Team() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setUsers(await api.listUsers());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="page-head">
        <h1>Team accounts</h1>
      </div>

      <div className="two-col">
        <section className="panel" aria-labelledby="accounts-h">
          <h2 id="accounts-h">Everyone with access</h2>
          {error && (
            <div className="alert alert-error" role="alert">
              <span>{error}</span>
              <button className="btn btn-quiet btn-sm" onClick={load}>Try again</button>
            </div>
          )}
          {users === null && !error && <p className="muted state">Loading accounts…</p>}
          {users && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <span className="cell-main">{u.name}</span>
                        <span className="cell-sub">{u.email}</span>
                      </td>
                      <td>{ROLE_LABEL[u.role] ?? u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <CreateAccount onCreated={load} />
      </div>
    </>
  );
}
