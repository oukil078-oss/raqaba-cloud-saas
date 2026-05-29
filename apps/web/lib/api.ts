const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://raqaba-api.onrender.com/api';

export function getToken() { return null; }
export function setToken(token: string) { }
export function clearToken() { }

export async function api<T>(path: string, options: any = {}): Promise<T> {
  console.log('API call:', path);
  return { data: [] } as any;
}

export const authApi = {
  login: async (email: string, password: string) => ({ token: 'fake' }),
  register: async (payload: any) => ({ token: 'fake' }),
  me: async () => ({ user: {}, business: {} })
};
