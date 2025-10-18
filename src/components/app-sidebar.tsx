/* eslint-disable react-refresh/only-export-components */
import type { ComponentProps, ComponentType, SVGProps } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, ShoppingCart } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

type AppSidebarProps = ComponentProps<typeof Sidebar> & {
  onLogout?: () => void
}

type NavigationItem = {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const sidebarNavigation: NavigationItem[] = [
  {
    to: '/order',
    label: 'Order',
    icon: ShoppingCart,
  },
]

export function AppSidebar({ onLogout, ...props }: AppSidebarProps) {
  const location = useLocation()

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-14 items-center px-2">
          <span className="text-lg font-semibold tracking-tight">POS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarNavigation.map((item) => {
                const isActive =
                  location.pathname === item.to ||
                  location.pathname.startsWith(`${item.to}/`)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.to}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                type="button"
                onClick={() => onLogout?.()}
                className="w-full"
              >
                <LogOut className="size-4" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
