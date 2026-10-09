import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, basicToken, setAuthToken, setUnauthorizedHandler } from './api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'workshophub.session';

export const ROLE_LABEL = {
  ADMIN: 'Administrator',
  MANAGER: 'Programme manager',
  STAFF: 'Front desk',
};

export const ROLE_CAN = {
  ADMIN: { manageUsers: true, viewWorkshops: false, editWorkshops: false, register: false },
  MANAGER: { manageUsers: false, viewWorkshops: true, editWorkshops: true, register: true },
  STAFF: { manageUsers: false, viewWorkshops: true, editWorkshops: false, register: true },
};

export const homePathFor = (role) => (role === 'ADMIN' ? '/team' : '/workshops');

function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.token || !session?.user) return null;
    setAuthToken(session.token);
    return session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);
  const [notice, setNotice] = useState('');

  const logout = useCallback((message = '') => {
    setAuthToken(null);
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setNotice(typeof message === 'string' ? message : '');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout('Your session ended. Sign in again to continue.'));
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const user = await api.login(email.trim(), password);
    const token = basicToken(user.email, password);
    setAuthToken(token);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    setSession({ token, user });
    setNotice('');
    return user;
  }, []);

  const value = useMemo(() => {
    const user = session?.user ?? null;
    return {
      user,
      can: user ? ROLE_CAN[user.role] : null,
      login,
      logout,
      notice,
      clearNotice: () => setNotice(''),
    };
  }, [session, login, logout, notice]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
