const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://raqaba-api.onrender.com/api';

type FetchOptions = RequestInit & { auth?: boolean };
export type ApiList<T> = { data: T[]; meta?: { total: number; page: number; limit: number } };
export type ApiOne<T> = { data: T };

export function getToken() { if (typeof window === 'undefined') return null; return localStorage.getItem('raqaba_token'); }
export function setToken(token: string) { localStorage.setItem('raqaba_token', token); }
export function clearToken() { localStorage.removeItem('raqaba_token'); }

export async function api<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (options.auth !== false && token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, { ...options, headers, cache: 'no-store' });
  if (!res.ok) {
    let message = 'تعذر تنفيذ العملية';
    try { const data = await res.json(); message = data.message || message; } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  login: (email: string, password: string) => api<any>('/auth/login', { method: 'POST', auth: false, body: JSON.stringify({ email, password }) }),
  register: (payload: any) => api<any>('/auth/register', { method: 'POST', auth: false, body: JSON.stringify(payload) }),
  me: () => api<any>('/auth/me')
};
