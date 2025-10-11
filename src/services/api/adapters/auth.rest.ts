import { http } from '@/lib/fetcher';

export const authRest = {
  async login(email: string, password: string) {
    const response = await http('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return response.json();
  },

  async me() {
    return (await http('/api/auth/me')).json();
  },

  async refresh() {
    return (await http('/api/auth/refresh', { method: 'POST' })).json();
  },

  async logout() {
    await http('/api/auth/logout', { method: 'POST' });
  },
};
