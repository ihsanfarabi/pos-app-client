import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { AppSidebar, sidebarNavigation } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/stores/session';
import { authRest } from '@/services/api/adapters/auth.rest';
import { cn } from '@/lib/utils';

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
      <LayoutContent onLogout={handleLogout} activeItemLabel={activeItem?.label} />
    </SidebarProvider>
  );
}

type LayoutContentProps = {
  onLogout: () => void | Promise<void>;
  activeItemLabel?: string;
};

function LayoutContent({ onLogout, activeItemLabel }: LayoutContentProps) {
  const { state } = useSidebar();
  const isSidebarExpanded = state === 'expanded';

  return (
    <SidebarInset className="flex flex-1 flex-col bg-muted/50">
      <div
        className={cn(
          'flex h-14 items-center gap-2 border-b border-border bg-background/80 px-2 backdrop-blur sm:px-3',
          isSidebarExpanded && 'md:px-3',
        )}
      >
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="hidden h-6 md:block" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{activeItemLabel ?? 'POS'}</span>
        </div>
        <Button onClick={onLogout} variant="outline" size="sm" className="ml-auto md:hidden">
          Logout
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div
          className={cn(
            'w-full px-1 py-2 transition-[padding]',
            isSidebarExpanded
              ? 'sm:px-2 sm:py-2 md:px-3 md:py-3'
              : 'sm:px-3 sm:py-3 md:px-4 md:py-4',
          )}
        >
          <Outlet />
        </div>
      </div>
    </SidebarInset>
  );
}
