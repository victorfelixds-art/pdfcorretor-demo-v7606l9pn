import { Home, History, User } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function AppSidebar() {
  const location = useLocation()

  const menuItems = [
    {
      title: 'Nova Proposta',
      url: '/',
      icon: Home,
    },
    {
      title: 'Histórico de Propostas',
      url: '/historico',
      icon: History,
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 flex items-center justify-center border-b border-sidebar-border/50 px-4">
        <div className="flex items-center gap-2 font-bold text-xl w-full overflow-hidden transition-all group-data-[collapsible=icon]:justify-center">
          <span className="text-primary truncate">pdfcorretor</span>
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium group-data-[collapsible=icon]:hidden">
            demo
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                tooltip={item.title}
              >
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=12"
                  alt="Corretor Demo"
                />
                <AvatarFallback className="rounded-lg">CD</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Corretor Demo</span>
                <span className="truncate text-xs">Premium Plan</span>
              </div>
              <User className="ml-auto size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
