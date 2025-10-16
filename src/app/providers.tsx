import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { startFlusher } from '@/services/sync/outbox';
import { useSession } from '@/stores/session';
import { authRest } from '@/services/api/adapters/auth.rest';

const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  const hydrateDevice = useSession((state) => state.hydrateDevice);
  const setToken = useSession((state) => state.setToken);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void hydrateDevice();
    startFlusher();

    (async () => {
      try {
        const { access_token } = await authRest.refresh();
        setToken(access_token);
      } catch {
        setToken(undefined);
      } finally {
        setReady(true);
      }
    })();
  }, [hydrateDevice, setToken]);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}
