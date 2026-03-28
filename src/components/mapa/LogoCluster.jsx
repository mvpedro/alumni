import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const SECTOR_COLORS = {
  'Software': { bg: 'bg-blue-500/12', text: 'text-blue-700', fill: '#3b82f6' },
  'Engenharia': { bg: 'bg-emerald-500/12', text: 'text-emerald-700', fill: '#10b981' },
  'Fábrica e Indústria': { bg: 'bg-orange-500/12', text: 'text-orange-700', fill: '#f97316' },
  'Big Tech': { bg: 'bg-violet-500/12', text: 'text-violet-700', fill: '#8b5cf6' },
  'Energia': { bg: 'bg-yellow-500/12', text: 'text-yellow-700', fill: '#eab308' },
  'Startups': { bg: 'bg-pink-500/12', text: 'text-pink-700', fill: '#ec4899' },
  'Consultoria': { bg: 'bg-slate-500/12', text: 'text-slate-700', fill: '#64748b' },
  'Aeroespacial': { bg: 'bg-cyan-500/12', text: 'text-cyan-700', fill: '#06b6d4' },
  'Automotivo': { bg: 'bg-red-500/12', text: 'text-red-700', fill: '#ef4444' },
  'Mercado Financeiro': { bg: 'bg-green-500/12', text: 'text-green-700', fill: '#22c55e' },
  'Ensino e Pesquisa': { bg: 'bg-indigo-500/12', text: 'text-indigo-700', fill: '#6366f1' },
  'Serviços': { bg: 'bg-teal-500/12', text: 'text-teal-700', fill: '#14b8a6' },
  'Governo': { bg: 'bg-amber-500/12', text: 'text-amber-700', fill: '#f59e0b' },
}

const DEFAULT_COLOR = { bg: 'bg-muted', text: 'text-foreground', fill: '#94a3b8' }

function getColor(sector) {
  return SECTOR_COLORS[sector] || DEFAULT_COLOR
}

function LogoImage({ src, name, color }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  if (errored || !src) {
    return (
      <div className={`flex h-full w-full items-center justify-center p-1.5 ${color.bg}`}>
        <span className={`text-center text-[10px] font-bold leading-tight ${color.text}`}>
          {name}
        </span>
      </div>
    )
  }

  return (
    <>
      {!loaded && (
        <div className={`absolute inset-0 flex items-center justify-center ${color.bg}`}>
          <span className={`text-lg font-bold ${color.text} opacity-30`}>
            {name.charAt(0)}
          </span>
        </div>
      )}
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`h-full w-full object-contain p-1.5 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  )
}

function tierClass(count) {
  if (count >= 5) return 'col-span-2 row-span-2'
  if (count >= 2) return 'col-span-2 row-span-1'
  return 'col-span-1 row-span-1'
}

export function LogoCluster({ logoCluster = [], onClick }) {
  const [hovered, setHovered] = useState(null)

  // Flatten all companies from all sectors, sorted by sector then count
  const sectorOrder = Object.keys(SECTOR_COLORS)
  const allCompanies = logoCluster
    .flatMap((group) =>
      group.companies.map((c) => ({ ...c, sector: group.sector }))
    )
    .sort((a, b) => {
      const aIdx = sectorOrder.indexOf(a.sector)
      const bIdx = sectorOrder.indexOf(b.sector)
      const sectorCmp = (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx)
      if (sectorCmp !== 0) return sectorCmp
      return b.alumni_count - a.alumni_count
    })

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Mosaic grid */}
        <div className="grid auto-rows-[60px] grid-cols-4 gap-1 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {allCompanies.map((c) => {
            const color = getColor(c.sector)
            const isHovered = hovered === c.id

            return (
              <div key={c.id} className={tierClass(c.alumni_count)}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onMouseEnter={() => setHovered(c.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => onClick?.(c.id)}
                      className={`
                        relative h-full w-full overflow-hidden rounded-md border bg-white
                        transition-all duration-300 ease-out dark:bg-slate-800
                        ${color.bg}
                        ${isHovered ? 'z-20 scale-[1.3] shadow-2xl ring-2 ring-primary/40' : 'shadow-sm hover:shadow-md'}
                      `}
                    >
                      <LogoImage src={c.logo_url} name={c.name} color={color} />
                      <span className="absolute bottom-0.5 right-1 rounded-sm bg-white/70 px-1 text-[9px] font-bold text-muted-foreground dark:bg-slate-800/70">
                        {c.alumni_count}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.sector} · {c.alumni_count} {c.alumni_count === 1 ? 'egresso' : 'egressos'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )
          })}
        </div>

        {/* Sector legend */}
        <div className="flex flex-wrap gap-2">
          {logoCluster.map((group) => {
            const color = getColor(group.sector)
            return (
              <span
                key={group.sector}
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${color.bg} ${color.text}`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color.fill }} />
                {group.sector}
              </span>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
