import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return <div className="flex justify-center p-8">Carregando...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
