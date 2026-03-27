import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ApprovedRoute({ children }) {
  const { isAuthenticated, isApproved, loading } = useAuth()
  if (loading) return <div className="flex justify-center p-8">Carregando...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isApproved) return <Navigate to="/perfil" replace />
  return children
}
