import { NavLink, Outlet } from 'react-router-dom';
import { ROLE_LABEL, useAuth } from '../auth.jsx';

export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 34 14" width="34" height="14" aria-hidden="true">
      <circle cx="7" cy="7" r="5" fill="currentColor" />
      <circle cx="17" cy="7" r="5" fill="currentColor" />
      <circle cx="27" cy="7" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function Layout() {
  const { user, can, logout } = useAuth();

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand"><Logo /> Workshop</span>
          <nav className="nav" aria-label="Main">
            {can.viewWorkshops && <NavLink to="/workshops">Workshops</NavLink>}
            {can.manageUsers && <NavLink to="/team">Team accounts</NavLink>}
          </nav>
          <div className="whoami">
            <span className="whoami-text">
              <strong>{user.name}</strong>
              <span>{ROLE_LABEL[user.role]}</span>
            </span>
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => logout()}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="page">
        <Outlet />
      </main>
    </>
  );
}
