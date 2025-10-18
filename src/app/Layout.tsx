import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSession } from '@/stores/session';
import { authRest } from '@/services/api/adapters/auth.rest';

const navItems = [
  { to: '/order', label: 'Order' },
];

export default function Layout() {
  const setToken = useSession((state) => state.setToken);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleLogout() {
    try {
      await authRest.logout();
    } catch {
      // ignore logout errors
    } finally {
      queryClient.clear();
      setToken(undefined);
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/50">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-5xl items-center justify-between gap-8 px-6">
          <div className="flex items-center gap-10">
            <span className="text-lg font-semibold tracking-tight">POS</span>
            <nav className="flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                      isActive && 'bg-foreground text-background',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
