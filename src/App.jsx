import { lazy, Suspense } from 'react'
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
import { Skeleton } from '@/components/ui/skeleton'

// Eagerly loaded (critical path)
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'

// Lazy loaded (non-critical)
const EsqueciSenha = lazy(() => import('@/pages/EsqueciSenha'))
const Perfil = lazy(() => import('@/pages/Perfil'))
const BancoDeDados = lazy(() => import('@/pages/BancoDeDados'))
const PerfilView = lazy(() => import('@/pages/PerfilView'))
const MapaDosEgressos = lazy(() => import('@/pages/MapaDosEgressos'))
const MapaExperiment = lazy(() => import('@/pages/MapaExperiment'))
const Contato = lazy(() => import('@/pages/Contato'))
const Entrevistas = lazy(() => import('@/pages/Entrevistas'))
const EntrevistaPost = lazy(() => import('@/pages/EntrevistaPost'))
const TrabalhoAlumni = lazy(() => import('@/pages/TrabalhoAlumni'))
const TrabalhoAlumniVideo = lazy(() => import('@/pages/TrabalhoAlumniVideo'))
const Palestras = lazy(() => import('@/pages/Palestras'))

// Admin pages — always lazy
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const Usuarios = lazy(() => import('@/pages/admin/Usuarios'))
const Empresas = lazy(() => import('@/pages/admin/Empresas'))
const Setores = lazy(() => import('@/pages/admin/Setores'))
const ContatoAdmin = lazy(() => import('@/pages/admin/ContatoAdmin'))
const EntrevistasAdmin = lazy(() => import('@/pages/admin/EntrevistasAdmin'))
const TrabalhoAlumniAdmin = lazy(() => import('@/pages/admin/TrabalhoAlumniAdmin'))
const PalestrasAdmin = lazy(() => import('@/pages/admin/PalestrasAdmin'))
const BadgesAdmin = lazy(() => import('@/pages/admin/BadgesAdmin'))

function PageLoader() {
  return (
    <div className="container mx-auto flex items-center justify-center px-4 py-24">
      <div className="space-y-4 w-full max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  )
}

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
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/palestras" element={<Palestras />} />

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
                  <Route path="palestras" element={<PalestrasAdmin />} />
                  <Route path="badges" element={<BadgesAdmin />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </Suspense>
          </TooltipProvider>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
    </Sentry.ErrorBoundary>
  )
}
