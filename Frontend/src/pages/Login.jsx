import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { homePathFor, useAuth } from '../auth.jsx';
import { Logo } from '../components/Layout.jsx';

export default function Login() {
  const { user, login, notice, clearNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    clearNotice();
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <main className="login">
      <div className="login-panel">
        <p className="brand brand-lg"><Logo /> Workshop Hub</p>
        <h1 className="login-title">Sign in</h1>
        <p className="muted">Accounts are created by an administrator. There is no public sign-up.</p>

        {notice && <p className="alert alert-info" role="status">{notice}</p>}

        <form onSubmit={submit} className="stack">
          <label className="field">
            <span>Email</span>
            <input
              type="email" autoComplete="username" required autoFocus
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password" autoComplete="current-password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="alert alert-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

      </div>
    </main>
  );
}
