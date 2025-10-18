import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { AppSidebar, sidebarNavigation } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/stores/session';
import { authRest } from '@/services/api/adapters/auth.rest';

export default function Layout() {
  const setToken = useSession((state) => state.setToken);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();

  const activeItem = sidebarNavigation.find((item) =>
    location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
  );

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
    <SidebarProvider>
      <AppSidebar onLogout={handleLogout} />
      <SidebarInset className="flex flex-1 flex-col bg-muted/50">
        <div className="flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{activeItem?.label ?? 'POS'}</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="ml-auto md:hidden"
          >
            Logout
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-0 py-0 sm:px-8 sm:py-6">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
