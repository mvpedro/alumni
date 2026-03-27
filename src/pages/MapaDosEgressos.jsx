import { useNavigate } from 'react-router-dom'
import { Users, Building2, LayoutGrid, GraduationCap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMapaStats } from '@/hooks/useMapaStats'
import { StatCard } from '@/components/mapa/StatCard'
import { MapaCharts } from '@/components/mapa/MapaCharts'
import { LogoCluster } from '@/components/mapa/LogoCluster'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'

export default function MapaDosEgressos() {
  const { isAuthenticated, isApproved } = useAuth()
  const { data: stats, isLoading } = useMapaStats()
  const navigate = useNavigate()

  function handleLogoClick(companyId) {
    navigate(`/banco-de-dados?company=${companyId}`)
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <PageHeader
        title="Mapa dos Egressos"
        description="Visualize a distribuição dos egressos por empresa, setor e região."
      />

      {/* Stats grid */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard label="Alumni" value={stats?.totalAlumni} icon={Users} />
            <StatCard label="Empresas" value={stats?.totalCompanies} icon={Building2} />
            <StatCard label="Setores" value={stats?.totalSectors} icon={LayoutGrid} />
            <StatCard label="Turmas" value={stats?.totalClasses} icon={GraduationCap} />
          </>
        )}
      </div>

      {/* Charts */}
      {isLoading ? (
        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`rounded-xl border p-6 ${i === 2 ? 'lg:col-span-2' : ''}`}>
              <Skeleton className="mb-4 h-5 w-40" />
              <Skeleton className="h-[260px] w-full" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="mb-10">
          <MapaCharts
            alumniPerSector={stats.alumniPerSector}
            alumniPerClass={stats.alumniPerClass}
            alumniPerState={stats.alumniPerState}
          />
        </div>
      ) : null}

      {/* Logo cluster */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Empresas dos Egressos</h2>
        {isAuthenticated && isApproved ? (
          isLoading ? (
            <div className="flex flex-wrap gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-lg" />
              ))}
            </div>
          ) : stats?.logoCluster?.length > 0 ? (
            <LogoCluster logoCluster={stats.logoCluster} onClick={handleLogoClick} />
          ) : (
            <EmptyState
              icon={Building2}
              title="Nenhuma empresa cadastrada"
              description="As empresas dos egressos aparecerão aqui assim que forem cadastradas."
            />
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
