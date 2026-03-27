import { useNavigate } from 'react-router-dom'
import { Users, Building2, LayoutGrid, GraduationCap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMapaStats } from '@/hooks/useMapaStats'
import { StatCard } from '@/components/mapa/StatCard'
import { MapaCharts } from '@/components/mapa/MapaCharts'
import { LogoCluster } from '@/components/mapa/LogoCluster'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function MapaDosEgressos() {
  const { isAuthenticated, isApproved } = useAuth()
  const { data: stats, isLoading } = useMapaStats()
  const navigate = useNavigate()

  function handleLogoClick(companyId) {
    navigate(`/banco-de-dados?company=${companyId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Mapa dos Egressos</h1>

      {/* Stats grid */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Alumni"
          value={isLoading ? null : stats?.totalAlumni}
          icon={Users}
        />
        <StatCard
          label="Empresas"
          value={isLoading ? null : stats?.totalCompanies}
          icon={Building2}
        />
        <StatCard
          label="Setores"
          value={isLoading ? null : stats?.totalSectors}
          icon={LayoutGrid}
        />
        <StatCard
          label="Turmas"
          value={isLoading ? null : stats?.totalClasses}
          icon={GraduationCap}
        />
      </div>

      {/* Charts */}
      {!isLoading && stats && (
        <div className="mb-10">
          <MapaCharts
            alumniPerSector={stats.alumniPerSector}
            alumniPerClass={stats.alumniPerClass}
            alumniPerState={stats.alumniPerState}
          />
        </div>
      )}

      {/* Logo cluster */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Empresas dos Egressos</h2>
        {isAuthenticated && isApproved ? (
          isLoading ? (
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
          ) : stats?.logoCluster?.length > 0 ? (
            <LogoCluster logoCluster={stats.logoCluster} onClick={handleLogoClick} />
          ) : (
            <p className="text-muted-foreground">Nenhuma empresa cadastrada ainda.</p>
          )
        ) : (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground">
              Faça login e tenha seu cadastro aprovado para ver as empresas dos egressos.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Button asChild variant="outline">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/cadastro">Cadastrar-se</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
