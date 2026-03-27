import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ApprovedRoute } from '@/components/layout/ApprovedRoute'
import { AdminRoute } from '@/components/layout/AdminRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'
import Perfil from '@/pages/Perfil'
import Dashboard from '@/pages/admin/Dashboard'
import Usuarios from '@/pages/admin/Usuarios'
import Empresas from '@/pages/admin/Empresas'
import Setores from '@/pages/admin/Setores'

function Placeholder({ name }) {
  return <div className="p-8 text-center text-lg">{name}</div>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth pages — no navbar/footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            {/* Main layout — navbar + footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Placeholder name="Landing" />} />
              <Route path="/contato" element={<Placeholder name="Contato" />} />
              <Route path="/mapa-dos-egressos" element={<Placeholder name="Mapa dos Egressos" />} />

              <Route path="/perfil" element={
                <ProtectedRoute><Perfil /></ProtectedRoute>
              } />
              <Route path="/banco-de-dados" element={
                <ApprovedRoute><Placeholder name="Banco de Dados" /></ApprovedRoute>
              } />
              <Route path="/perfil/:id" element={
                <ApprovedRoute><Placeholder name="Perfil View" /></ApprovedRoute>
              } />

              <Route path="/admin" element={
                <AdminRoute><AdminLayout /></AdminRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="empresas" element={<Empresas />} />
                <Route path="setores" element={<Setores />} />
                <Route path="contato" element={<Placeholder name="Admin Contato" />} />
              </Route>

              <Route path="*" element={<Placeholder name="404 — Página não encontrada" />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}
