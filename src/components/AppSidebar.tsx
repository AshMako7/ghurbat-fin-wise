import { Home, PlusCircle, Target, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Home', url: '/home', icon: Home },
  { title: 'Add Transaction', url: '/add', icon: PlusCircle },
  { title: 'Goals', url: '/goals', icon: Target },
  { title: 'Insights', url: '/insights', icon: TrendingUp },
];

export function AppSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar className={state === 'collapsed' ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarContent>
        <div className="flex items-center justify-between p-4">
          {state !== 'collapsed' && <h2 className="text-lg font-semibold text-foreground">Menu</h2>}
          <SidebarTrigger />
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-2 ${
                          isActive
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'hover:bg-accent/50 hover:text-accent-foreground'
                        }`
                      }
                      style={({ isActive }) => ({
                        color: isActive ? undefined : 'hsl(220 60% 20%)'
                      })}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== 'collapsed' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
