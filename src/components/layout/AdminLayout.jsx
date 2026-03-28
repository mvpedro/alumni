import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Building2, Layers, Mail, FileText, Video, Mic, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { to: '/admin/setores', label: 'Setores', icon: Layers },
  { to: '/admin/contato', label: 'Mensagens', icon: Mail },
  { to: '/admin/entrevistas', label: 'Entrevistas', icon: FileText },
  { to: '/admin/trabalho-alumni', label: 'Trabalho Alumni', icon: Video },
  { to: '/admin/palestras', label: 'Palestras', icon: Mic },
]

function NavItems({ onClick }) {
  return navItems.map(({ to, label, icon: Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  ))
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden w-56 shrink-0 border-r bg-muted/30 md:block">
        <nav className="flex flex-col gap-1 p-3 pt-4">
          <NavItems />
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile admin nav trigger */}
        <div className="flex items-center border-b px-4 py-2 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Menu className="h-4 w-4" />
                Menu Admin
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Painel Admin</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1">
                <NavItems onClick={() => setMobileOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Outlet />
      </main>
    </div>
  )
}
