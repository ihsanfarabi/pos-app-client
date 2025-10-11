import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authRest } from '@/services/api/adapters/auth.rest';
import { useSession } from '@/stores/session';

export default function Login() {
  const navigate = useNavigate();
  const setToken = useSession((state) => state.setToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit() {
    setSubmitting(true);
    setError(undefined);
    try {
      const response = await authRest.login(email, password);
      setToken(response.access_token);
      navigate('/sell');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <input
        className="border p-2 mb-2 w-full"
        placeholder="Email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        className="border p-2 mb-4 w-full"
        placeholder="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error ? (
        <p className="text-sm text-red-600 mb-2" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </div>
  );
}
