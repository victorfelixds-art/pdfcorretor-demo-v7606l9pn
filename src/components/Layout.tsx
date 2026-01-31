import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Outlet, useLocation } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Gerador de Propostas'
    if (location.pathname === '/historico') return 'Histórico'
    if (location.pathname.startsWith('/print')) return 'Impressão'
    return 'pdfcorretor'
  }

  // If it's a print view, we might want a simpler layout or no sidebar
  if (location.pathname.startsWith('/print')) {
    return <Outlet />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background overflow-hidden flex flex-col h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 z-10">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-sm font-semibold text-foreground/80">
              {getPageTitle()}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-muted/20">
          <div className={cn('mx-auto max-w-5xl h-full animate-fade-in')}>
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
