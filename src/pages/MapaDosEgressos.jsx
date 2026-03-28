import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Building2, LayoutGrid, GraduationCap } from 'lucide-react'
import { useMapaStats } from '@/hooks/useMapaStats'
import { StatCard } from '@/components/mapa/StatCard'
import { MapaCharts } from '@/components/mapa/MapaCharts'
import { LogoCluster } from '@/components/mapa/LogoCluster'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'

const SECTOR_COLORS = {
  'Software': '#3b82f6',
  'Engenharia': '#10b981',
  'Fábrica e Indústria': '#f97316',
  'Big Tech': '#8b5cf6',
  'Energia': '#eab308',
  'Startups': '#ec4899',
  'Consultoria': '#64748b',
  'Aeroespacial': '#06b6d4',
  'Automotivo': '#ef4444',
  'Mercado Financeiro': '#22c55e',
  'Ensino e Pesquisa': '#6366f1',
  'Serviços': '#14b8a6',
  'Governo': '#f59e0b',
}

export default function MapaDosEgressos() {
  const { data: stats, isLoading } = useMapaStats()
  const navigate = useNavigate()
  const [selectedSector, setSelectedSector] = useState(null)

  function handleLogoClick(companyId) {
    navigate(`/banco-de-dados?company=${companyId}`)
  }

  function toggleSector(sector) {
    setSelectedSector((prev) => (prev === sector ? null : sector))
  }

  // Filter data by selected sector
  const filteredLogoCluster = selectedSector
    ? stats?.logoCluster?.filter((g) => g.sector === selectedSector) ?? []
    : stats?.logoCluster ?? []

  const filteredPerSector = selectedSector
    ? stats?.alumniPerSector?.filter((s) => s.name === selectedSector) ?? []
    : stats?.alumniPerSector ?? []

  return (
    <div className="container mx-auto px-4 py-10">
      <PageHeader
        title="Mapa dos Egressos"
        description="Visualize a distribuição dos egressos por empresa, setor e região."
      />

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Sector filter pills */}
      {!isLoading && stats?.logoCluster?.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSector(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                !selectedSector
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Todos os setores
            </button>
            {stats.logoCluster.map((group) => {
              const isActive = selectedSector === group.sector
              const color = SECTOR_COLORS[group.sector] || '#94a3b8'
              const companyCount = group.companies.length

              return (
                <button
                  key={group.sector}
                  onClick={() => toggleSector(group.sector)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  style={isActive ? { backgroundColor: color } : {}}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {group.sector}
                  <span className="opacity-60">({companyCount})</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Logo cluster — hero section, public */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">
          {selectedSector ? `Onde estão os egressos — ${selectedSector}` : 'Onde estão os egressos'}
        </h2>
        {isLoading ? (
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-24 rounded-lg" />
            ))}
          </div>
        ) : filteredLogoCluster.length > 0 ? (
          <LogoCluster logoCluster={filteredLogoCluster} onClick={handleLogoClick} />
        ) : (
          <EmptyState
            icon={Building2}
            title="Nenhuma empresa neste setor"
            description="Selecione outro setor ou veja todos."
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
          alumniPerSector={filteredPerSector}
          alumniPerClass={stats.alumniPerClass}
          alumniPerState={stats.alumniPerState}
        />
      ) : null}
    </div>
  )
}
