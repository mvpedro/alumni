import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const SECTOR_COLORS = {
  'Software': { bg: 'bg-blue-500/12', border: 'border-blue-400/40', text: 'text-blue-700', fill: '#3b82f6', section: 'bg-blue-50 dark:bg-blue-950/30' },
  'Engenharia': { bg: 'bg-emerald-500/12', border: 'border-emerald-400/40', text: 'text-emerald-700', fill: '#10b981', section: 'bg-emerald-50 dark:bg-emerald-950/30' },
  'Fábrica e Indústria': { bg: 'bg-orange-500/12', border: 'border-orange-400/40', text: 'text-orange-700', fill: '#f97316', section: 'bg-orange-50 dark:bg-orange-950/30' },
  'Big Tech': { bg: 'bg-violet-500/12', border: 'border-violet-400/40', text: 'text-violet-700', fill: '#8b5cf6', section: 'bg-violet-50 dark:bg-violet-950/30' },
  'Energia': { bg: 'bg-yellow-500/12', border: 'border-yellow-400/40', text: 'text-yellow-700', fill: '#eab308', section: 'bg-yellow-50 dark:bg-yellow-950/30' },
  'Startups': { bg: 'bg-pink-500/12', border: 'border-pink-400/40', text: 'text-pink-700', fill: '#ec4899', section: 'bg-pink-50 dark:bg-pink-950/30' },
  'Consultoria': { bg: 'bg-slate-500/12', border: 'border-slate-400/40', text: 'text-slate-700', fill: '#64748b', section: 'bg-slate-100 dark:bg-slate-900/30' },
  'Aeroespacial': { bg: 'bg-cyan-500/12', border: 'border-cyan-400/40', text: 'text-cyan-700', fill: '#06b6d4', section: 'bg-cyan-50 dark:bg-cyan-950/30' },
  'Automotivo': { bg: 'bg-red-500/12', border: 'border-red-400/40', text: 'text-red-700', fill: '#ef4444', section: 'bg-red-50 dark:bg-red-950/30' },
  'Mercado Financeiro': { bg: 'bg-green-500/12', border: 'border-green-400/40', text: 'text-green-700', fill: '#22c55e', section: 'bg-green-50 dark:bg-green-950/30' },
  'Ensino e Pesquisa': { bg: 'bg-indigo-500/12', border: 'border-indigo-400/40', text: 'text-indigo-700', fill: '#6366f1', section: 'bg-indigo-50 dark:bg-indigo-950/30' },
  'Serviços': { bg: 'bg-teal-500/12', border: 'border-teal-400/40', text: 'text-teal-700', fill: '#14b8a6', section: 'bg-teal-50 dark:bg-teal-950/30' },
  'Governo': { bg: 'bg-amber-500/12', border: 'border-amber-400/40', text: 'text-amber-700', fill: '#f59e0b', section: 'bg-amber-50 dark:bg-amber-950/30' },
}

const DEFAULT_COLOR = { bg: 'bg-muted', border: 'border-border', text: 'text-foreground', fill: '#94a3b8', section: 'bg-muted/50' }

function getColor(sector) {
  return SECTOR_COLORS[sector] || DEFAULT_COLOR
}

function useCompanyData() {
  return useQuery({
    queryKey: ['experiment-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_alumni_counts')
        .select('*')
        .order('alumni_count', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

// Logo image with lazy loading, fade-in on load, and text fallback
function LogoImage({ src, name, color }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  if (errored || !src) {
    // Text fallback — company name centered
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
      {/* Placeholder while loading — company initial */}
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
        className={`
          h-full w-full object-contain p-1.5
          transition-opacity duration-300
          ${loaded ? 'opacity-100' : 'opacity-0'}
        `}
      />
    </>
  )
}

// Shared tile component — image fills the card, minimal padding
function CompanyTile({ company, hovered, setHovered, sizeStyle, className = '' }) {
  const color = getColor(company.sector_name)
  const isHovered = hovered === company.company_id

  // Use placeholder images for the experiment (seeded by name for consistency)
  const seed = company.company_name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
  const placeholderUrl = `https://picsum.photos/seed/${seed}/200/100`
  const logoSrc = company.logo_url || placeholderUrl

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onMouseEnter={() => setHovered(company.company_id)}
          onMouseLeave={() => setHovered(null)}
          className={`
            relative overflow-hidden rounded-md border bg-white
            transition-all duration-300 ease-out dark:bg-slate-800
            ${color.border}
            ${isHovered ? 'z-20 scale-[1.3] shadow-2xl ring-2 ring-primary/40' : 'shadow-sm hover:shadow-md'}
            ${className}
          `}
          style={sizeStyle}
        >
          <LogoImage src={logoSrc} name={company.company_name} color={color} />
          <span className="absolute bottom-0.5 right-1 rounded-sm bg-white/70 px-1 text-[9px] font-bold text-muted-foreground dark:bg-slate-800/70">
            {company.alumni_count}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="font-semibold">{company.company_name}</p>
        <p className="text-xs text-muted-foreground">{company.sector_name} · {company.alumni_count} egressos</p>
      </TooltipContent>
    </Tooltip>
  )
}

// ─────────────────────────────────────────────────────────────
// VARIATION A: Mosaic — all tiles in one grid, no breaks,
// sector is only indicated by tile background color.
// Everything interlocks freely.
// ─────────────────────────────────────────────────────────────
function BentoMosaicView({ companies }) {
  const [hovered, setHovered] = useState(null)

  // Sort by sector (so same colors cluster) then by count within sector
  const sectorOrder = Object.keys(SECTOR_COLORS)
  const sorted = [...companies].sort((a, b) => {
    const aIdx = sectorOrder.indexOf(a.sector_name)
    const bIdx = sectorOrder.indexOf(b.sector_name)
    const sectorCmp = (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx)
    if (sectorCmp !== 0) return sectorCmp
    return b.alumni_count - a.alumni_count
  })

  // Build a map of index → sector for neighbor detection
  // We'll use this to determine which edges of a tile border a different sector
  const COLS = 12 // max columns at xl

  function tierClass(count) {
    if (count >= 5) return 'col-span-2 row-span-2'
    if (count >= 2) return 'col-span-2 row-span-1'
    return 'col-span-1 row-span-1'
  }

  function tierSpan(count) {
    if (count >= 5) return { cols: 2, rows: 2 }
    if (count >= 2) return { cols: 2, rows: 1 }
    return { cols: 1, rows: 1 }
  }

  // Place tiles in a virtual grid to detect sector boundaries
  const grid = {} // "row,col" → sector_name
  let curCol = 0
  let curRow = 0

  const placements = sorted.map((c) => {
    const { cols, rows } = tierSpan(c.alumni_count)

    // If tile doesn't fit in current row, move to next
    if (curCol + cols > COLS) {
      curCol = 0
      curRow++
    }

    // Skip occupied cells
    while (grid[`${curRow},${curCol}`]) {
      curCol++
      if (curCol >= COLS) { curCol = 0; curRow++ }
    }

    const placement = { company: c, row: curRow, col: curCol, cols, rows }

    // Mark cells as occupied
    for (let r = curRow; r < curRow + rows; r++) {
      for (let cc = curCol; cc < curCol + cols; cc++) {
        grid[`${r},${cc}`] = c.sector_name
      }
    }

    curCol += cols
    if (curCol >= COLS) { curCol = 0; curRow++ }

    return placement
  })

  // For each tile, check if its edges border a different sector
  function getOutlineStyle(placement) {
    const { row, col, cols, rows, company } = placement
    const sector = company.sector_name
    const color = getColor(sector)
    const borderWidth = '2.5px'
    const borderColor = color.fill

    const borders = {}

    // Check top edge
    let topDiff = false
    for (let c = col; c < col + cols; c++) {
      const neighbor = grid[`${row - 1},${c}`]
      if (neighbor !== sector) { topDiff = true; break }
    }
    if (topDiff) borders.borderTop = `${borderWidth} solid ${borderColor}`

    // Check bottom edge
    let bottomDiff = false
    for (let c = col; c < col + cols; c++) {
      const neighbor = grid[`${row + rows},${c}`]
      if (neighbor !== sector) { bottomDiff = true; break }
    }
    if (bottomDiff) borders.borderBottom = `${borderWidth} solid ${borderColor}`

    // Check left edge
    let leftDiff = false
    for (let r = row; r < row + rows; r++) {
      const neighbor = grid[`${r},${col - 1}`]
      if (neighbor !== sector) { leftDiff = true; break }
    }
    if (leftDiff) borders.borderLeft = `${borderWidth} solid ${borderColor}`

    // Check right edge
    let rightDiff = false
    for (let r = row; r < row + rows; r++) {
      const neighbor = grid[`${r},${col + cols}`]
      if (neighbor !== sector) { rightDiff = true; break }
    }
    if (rightDiff) borders.borderRight = `${borderWidth} solid ${borderColor}`

    return borders
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Mosaico contínuo com contornos de setor. Os tiles encaixam livremente
          e uma borda colorida aparece apenas nas extremidades de cada grupo.
        </p>
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridAutoRows: '60px',
          }}
        >
          {placements.map(({ company: c, row, col, cols, rows }) => {
            const color = getColor(c.sector_name)
            const outlineStyle = getOutlineStyle({ company: c, row, col, cols, rows })

            return (
              <div
                key={c.company_id}
                style={{
                  gridColumn: `${col + 1} / span ${cols}`,
                  gridRow: `${row + 1} / span ${rows}`,
                  ...outlineStyle,
                }}
                className={`${color.bg}`}
              >
                <CompanyTile
                  company={c}
                  hovered={hovered}
                  setHovered={setHovered}
                  sizeStyle={{ width: '100%', height: '100%' }}
                  className="!rounded-none !border-0"
                />
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}

// ─────────────────────────────────────────────────────────────
// VARIATION B: Sectored Bento — each sector in its own box
// Clear physical divide between sectors, each with header
// ─────────────────────────────────────────────────────────────
function BentoSectoredView({ companies }) {
  const [hovered, setHovered] = useState(null)

  // Group by sector
  const sectors = {}
  companies.forEach((c) => {
    const name = c.sector_name || 'Outros'
    if (!sectors[name]) sectors[name] = []
    sectors[name].push(c)
  })

  const sectorList = Object.entries(sectors)
    .sort((a, b) => {
      const aTotal = a[1].reduce((sum, c) => sum + c.alumni_count, 0)
      const bTotal = b[1].reduce((sum, c) => sum + c.alumni_count, 0)
      return bTotal - aTotal
    })

  function tierClass(count) {
    if (count >= 5) return 'col-span-2 row-span-2'
    if (count >= 2) return 'col-span-2 row-span-1'
    return 'col-span-1 row-span-1'
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Cada setor tem sua própria área com borda e header.
          Divisão física clara entre setores.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {sectorList.map(([sectorName, sectorCompanies]) => {
            const color = getColor(sectorName)
            const totalAlumni = sectorCompanies.reduce((sum, c) => sum + c.alumni_count, 0)

            return (
              <div
                key={sectorName}
                className={`rounded-xl border-2 ${color.border} ${color.section} p-4`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${color.text}`}>
                    {sectorName}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {totalAlumni} egressos · {sectorCompanies.length} empresas
                  </span>
                </div>
                <div className="grid auto-rows-[60px] grid-cols-4 gap-1.5 sm:grid-cols-6">
                  {sectorCompanies.map((c) => (
                    <div key={c.company_id} className={tierClass(c.alumni_count)}>
                      <CompanyTile
                        company={c}
                        hovered={hovered}
                        setHovered={setHovered}
                        sizeStyle={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}

// ─────────────────────────────────────────────────────────────
// VARIATION C: Pure Size Bento — no sectors, just size = alumni
// Largest companies get the biggest tiles, everything in one
// continuous grid. No colors, no groups. Pure data.
// ─────────────────────────────────────────────────────────────
function BentoPureSizeView({ companies }) {
  const [hovered, setHovered] = useState(null)
  const maxCount = companies[0]?.alumni_count || 1

  // Already sorted by alumni_count desc from the query
  function tierClass(count) {
    if (count >= 8) return 'col-span-3 row-span-3'
    if (count >= 5) return 'col-span-2 row-span-2'
    if (count >= 3) return 'col-span-2 row-span-2'
    if (count >= 2) return 'col-span-2 row-span-1'
    return 'col-span-1 row-span-1'
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sem setores, sem cores. Tamanho é proporcional ao número de egressos.
          As maiores empresas dominam visualmente.
        </p>
        <div className="grid auto-rows-[55px] grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
          {companies.map((c) => {
            // Subtle grayscale gradient — darker = more alumni
            const intensity = Math.round(92 - (c.alumni_count / maxCount) * 25)

            return (
              <div key={c.company_id} className={tierClass(c.alumni_count)}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onMouseEnter={() => setHovered(c.company_id)}
                      onMouseLeave={() => setHovered(null)}
                      className={`
                        relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-200 p-2
                        transition-all duration-300 ease-out dark:border-slate-700
                        ${hovered === c.company_id ? 'z-20 scale-[1.25] shadow-2xl ring-2 ring-primary/50' : 'shadow-sm hover:shadow-md'}
                      `}
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: `hsl(0, 0%, ${intensity}%)`,
                      }}
                    >
                      {c.logo_url ? (
                        <img src={c.logo_url} alt={c.company_name} className="max-h-[60%] max-w-[80%] object-contain" />
                      ) : (
                        <PlaceholderLogo
                          name={c.company_name}
                          color={DEFAULT_COLOR}
                          size={c.alumni_count >= 5 ? 'xl' : c.alumni_count >= 3 ? 'lg' : c.alumni_count >= 2 ? 'md' : 'sm'}
                        />
                      )}
                      {c.alumni_count >= 2 && (
                        <span className="absolute bottom-1 right-1.5 rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 shadow-sm">
                          {c.alumni_count}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-semibold">{c.company_name}</p>
                    <p className="text-xs text-muted-foreground">{c.sector_name} · {c.alumni_count} egressos</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}

// ─────────────────────────────────────────────────────────────
// Main experiment page
// ─────────────────────────────────────────────────────────────
export default function MapaExperiment() {
  const { data: companies = [], isLoading } = useCompanyData()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-96 rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Mapa Visual — Experimento</h1>
      <p className="mb-8 text-muted-foreground">
        Três variações do Bento Grid com {companies.length} empresas.
        Cada retângulo colorido simula onde o logo ficaria. Hover para ampliar.
      </p>

      <Tabs defaultValue="sectored" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unified">Mosaico</TabsTrigger>
          <TabsTrigger value="sectored">Setores Divididos</TabsTrigger>
          <TabsTrigger value="pure-size">Só Tamanho</TabsTrigger>
        </TabsList>

        <TabsContent value="unified">
          <BentoMosaicView companies={companies} />
        </TabsContent>

        <TabsContent value="sectored">
          <BentoSectoredView companies={companies} />
        </TabsContent>

        <TabsContent value="pure-size">
          <BentoPureSizeView companies={companies} />
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <div className="mt-8 rounded-lg border bg-muted/30 p-4">
        <h3 className="mb-3 text-sm font-semibold">Legenda dos setores</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SECTOR_COLORS).map(([name, colors]) => (
            <span key={name} className={`rounded-md border px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.border} ${colors.text}`}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
