import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import * as Sentry from '@sentry/react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ApprovedRoute } from '@/components/layout/ApprovedRoute'
import { AdminRoute } from '@/components/layout/AdminRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'
import EsqueciSenha from '@/pages/EsqueciSenha'
import Perfil from '@/pages/Perfil'
import BancoDeDados from '@/pages/BancoDeDados'
import PerfilView from '@/pages/PerfilView'
import MapaDosEgressos from '@/pages/MapaDosEgressos'
import MapaExperiment from '@/pages/MapaExperiment'
import Landing from '@/pages/Landing'
import Contato from '@/pages/Contato'
import Entrevistas from '@/pages/Entrevistas'
import EntrevistaPost from '@/pages/EntrevistaPost'
import Dashboard from '@/pages/admin/Dashboard'
import Usuarios from '@/pages/admin/Usuarios'
import Empresas from '@/pages/admin/Empresas'
import Setores from '@/pages/admin/Setores'
import ContatoAdmin from '@/pages/admin/ContatoAdmin'
import EntrevistasAdmin from '@/pages/admin/EntrevistasAdmin'
import TrabalhoAlumni from '@/pages/TrabalhoAlumni'
import TrabalhoAlumniVideo from '@/pages/TrabalhoAlumniVideo'
import TrabalhoAlumniAdmin from '@/pages/admin/TrabalhoAlumniAdmin'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="mb-2 text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Página não encontrada.</p>
    </div>
  )
}

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={<div className="flex min-h-screen items-center justify-center p-8 text-center"><div><h1 className="mb-2 text-2xl font-bold">Algo deu errado</h1><p className="text-muted-foreground">Um erro inesperado ocorreu. Tente recarregar a página.</p></div></div>}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Routes>
              {/* Auth pages — no navbar/footer */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/esqueci-senha" element={<EsqueciSenha />} />

              {/* Main layout — navbar + footer */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/contato" element={<Contato />} />
                <Route path="/mapa-dos-egressos" element={<MapaDosEgressos />} />
                <Route path="/mapa-experiment" element={<MapaExperiment />} />
                <Route path="/entrevistas" element={<Entrevistas />} />
                <Route path="/entrevistas/:slug" element={<EntrevistaPost />} />
                <Route path="/trabalho-alumni" element={<TrabalhoAlumni />} />
                <Route path="/trabalho-alumni/:id" element={<TrabalhoAlumniVideo />} />

                <Route path="/perfil" element={
                  <ProtectedRoute><Perfil /></ProtectedRoute>
                } />
                <Route path="/banco-de-dados" element={<BancoDeDados />} />
                <Route path="/perfil/:id" element={
                  <ApprovedRoute><PerfilView /></ApprovedRoute>
                } />

                <Route path="/admin" element={
                  <AdminRoute><AdminLayout /></AdminRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="usuarios" element={<Usuarios />} />
                  <Route path="empresas" element={<Empresas />} />
                  <Route path="setores" element={<Setores />} />
                  <Route path="contato" element={<ContatoAdmin />} />
                  <Route path="entrevistas" element={<EntrevistasAdmin />} />
                  <Route path="trabalho-alumni" element={<TrabalhoAlumniAdmin />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
    </Sentry.ErrorBoundary>
  )
}
