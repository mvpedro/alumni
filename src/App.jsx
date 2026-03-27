import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

function Placeholder({ name }) {
  return <div className="p-8 text-center text-lg">{name}</div>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Placeholder name="Landing" />} />
          <Route path="/login" element={<Placeholder name="Login" />} />
          <Route path="/cadastro" element={<Placeholder name="Cadastro" />} />
          <Route path="/contato" element={<Placeholder name="Contato" />} />
          <Route path="/banco-de-dados" element={<Placeholder name="Banco de Dados" />} />
          <Route path="/mapa-dos-egressos" element={<Placeholder name="Mapa dos Egressos" />} />
          <Route path="/perfil" element={<Placeholder name="Perfil" />} />
          <Route path="/perfil/:id" element={<Placeholder name="Perfil View" />} />
          <Route path="/admin" element={<Placeholder name="Admin Dashboard" />} />
          <Route path="/admin/usuarios" element={<Placeholder name="Admin Usuarios" />} />
          <Route path="/admin/empresas" element={<Placeholder name="Admin Empresas" />} />
          <Route path="/admin/setores" element={<Placeholder name="Admin Setores" />} />
          <Route path="/admin/contato" element={<Placeholder name="Admin Contato" />} />
          <Route path="*" element={<Placeholder name="404 — Página não encontrada" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
