import { useSession } from '@/stores/session';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const REFRESH_PATH = '/api/auth/refresh';

let refreshPromise: Promise<boolean> | undefined;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${BASE_URL}${REFRESH_PATH}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          useSession.getState().setToken(undefined);
          return false;
        }

        const payload: { access_token?: string } = await response
          .json()
          .catch(() => ({}));
        useSession.getState().setToken(payload.access_token);
        return Boolean(payload.access_token);
      } catch {
        useSession.getState().setToken(undefined);
        return false;
      } finally {
        refreshPromise = undefined;
      }
    })();
  }

  return refreshPromise;
}

function buildHeaders(init: RequestInit, accessToken?: string) {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const initHeaders = init.headers ? new Headers(init.headers) : undefined;
  initHeaders?.forEach((value, key) => {
    headers.set(key, value);
  });

  return headers;
}

export async function http(path: string, init: RequestInit = {}) {
  async function executeRequest() {
    const token = useSession.getState().accessToken;
    return fetch(`${BASE_URL}${path}`, {
      ...init,
      credentials: init.credentials ?? 'include',
      headers: buildHeaders(init, token),
    });
  }

  let response = await executeRequest();

  if (response.status === 401 && path !== REFRESH_PATH) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await executeRequest();
    }
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`${response.status} ${errorText}`);
  }

  return response;
}
