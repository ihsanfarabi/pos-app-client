import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { startFlusher } from '@/services/sync/outbox';

const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  useEffect(() => {
    startFlusher();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}
