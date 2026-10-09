const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

let authToken = null;
let onUnauthorized = () => {};

export const apiBase = BASE;
export const setAuthToken = (token) => { authToken = token; };
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function basicToken(email, password) {
  const bytes = new TextEncoder().encode(`${email}:${password}`);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function messageFor(status, data) {
  if (data && typeof data.message === 'string' && data.message.trim()) return data.message;
  switch (status) {
    case 401: return 'Your session has expired. Sign in again.';
    case 403: return "You don't have permission to do that.";
    case 404: return "We couldn't find that.";
    case 409: return 'That conflicts with an existing record.';
    default: return `Something went wrong (error ${status}). Try again.`;
  }
}

async function request(path, { method = 'GET', body, params, auth = true } = {}) {
  const query = params
    ? new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
      ).toString()
    : '';

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && authToken) headers.Authorization = `Basic ${authToken}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}${query ? `?${query}` : ''}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(`Can't reach the server at ${BASE}. Check that the backend is running.`, 0);
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized();
    throw new ApiError(messageFor(res.status, data), res.status);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),

  // Workshops
  listWorkshops: (params) => request('/api/workshops', { params }),
  getWorkshop: (id) => request(`/api/workshops/${id}`),
  createWorkshop: (body) => request('/api/workshops', { method: 'POST', body }),
  updateWorkshop: (id, body) => request(`/api/workshops/${id}`, { method: 'PUT', body }),
  deleteWorkshop: (id) => request(`/api/workshops/${id}`, { method: 'DELETE' }),

  // Registrations
  listRegistrations: (workshopId) => request(`/api/workshops/${workshopId}/registrations`),
  register: (workshopId, body) =>
    request(`/api/workshops/${workshopId}/registrations`, { method: 'POST', body }),
  cancelRegistration: (id) => request(`/api/registrations/${id}/cancel`, { method: 'PATCH' }),

  // Accounts (Admin only)
  listUsers: () => request('/api/users'),
  createUser: (body) => request('/api/users', { method: 'POST', body }),
};
