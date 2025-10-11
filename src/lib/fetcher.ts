import { useSession } from '@/stores/session';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function http(path: string, init: RequestInit = {}) {
  const token = useSession.getState().accessToken;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers ?? {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`${response.status} ${errorText}`);
  }

  return response;
}
