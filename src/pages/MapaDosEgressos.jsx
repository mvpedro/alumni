import { useNavigate } from 'react-router-dom'
import { Users, Building2, LayoutGrid, GraduationCap } from 'lucide-react'
import { useMapaStats } from '@/hooks/useMapaStats'
import { StatCard } from '@/components/mapa/StatCard'
import { MapaCharts } from '@/components/mapa/MapaCharts'
import { LogoCluster } from '@/components/mapa/LogoCluster'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'

export default function MapaDosEgressos() {
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

      {/* Logo cluster — hero section, public */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Empresas dos Egressos</h2>
        {isLoading ? (
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-24 rounded-lg" />
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
        )}
      </div>

      {/* Charts */}
      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`rounded-xl border p-6 ${i === 2 ? 'lg:col-span-2' : ''}`}>
              <Skeleton className="mb-4 h-5 w-40" />
              <Skeleton className="h-[260px] w-full" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <MapaCharts
          alumniPerSector={stats.alumniPerSector}
          alumniPerClass={stats.alumniPerClass}
          alumniPerState={stats.alumniPerState}
        />
      ) : null}
    </div>
  )
}
