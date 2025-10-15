import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { startFlusher } from '@/services/sync/outbox';
import { useSession } from '@/stores/session';

const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  const hydrateDevice = useSession((state) => state.hydrateDevice);

  useEffect(() => {
    void hydrateDevice();
    startFlusher();
  }, [hydrateDevice]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}
