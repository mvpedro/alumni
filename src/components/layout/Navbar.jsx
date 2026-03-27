import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/banco-de-dados', label: 'Banco de Dados' },
  { to: '/mapa-dos-egressos', label: 'Mapa dos Egressos' },
  { to: '/entrevistas', label: 'Entrevistas' },
  { to: '/trabalho-alumni', label: 'Trabalho Alumni' },
  { to: '/contato', label: 'Contato' },
]

export function Navbar() {
  const { isAuthenticated, isAdmin, profile, alumni, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const links = publicLinks

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  function NavLinks({ onClick }) {
    return links.map((link) => (
      <Link key={link.to} to={link.to} onClick={onClick}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        {link.label}
      </Link>
    ))
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <img src="/alumni-logo.png" alt="Alumni Automação" className="h-8 w-auto" />
          <span className="hidden sm:inline">Alumni Automação</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLinks />
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground">Admin</Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/perfil"><Button variant="ghost" size="sm">{alumni?.full_name || profile?.full_name || 'Perfil'}</Button></Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>Sair</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
              <Link to="/cadastro"><Button size="sm">Cadastrar</Button></Link>
            </div>
          )}
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="mt-8 flex flex-col gap-4">
              <NavLinks onClick={() => setOpen(false)} />
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground">Admin</Link>
              )}
              {isAuthenticated ? (
                <>
                  <Link to="/perfil" onClick={() => setOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground">Meu Perfil</Link>
                  <Button variant="outline" size="sm" onClick={() => { handleSignOut(); setOpen(false) }}>Sair</Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}><Button variant="ghost" size="sm" className="w-full">Entrar</Button></Link>
                  <Link to="/cadastro" onClick={() => setOpen(false)}><Button size="sm" className="w-full">Cadastrar</Button></Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
