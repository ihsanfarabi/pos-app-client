import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authRest } from '@/services/api/adapters/auth.rest';
import { useSession } from '@/stores/session';
import { LoginForm } from '@/components/login-form';

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
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSubmit();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <LoginForm
        className="w-full max-w-sm"
        email={email}
        password={password}
        onEmailChange={(value) => setEmail(value)}
        onPasswordChange={(value) => setPassword(value)}
        onSubmit={handleFormSubmit}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}
