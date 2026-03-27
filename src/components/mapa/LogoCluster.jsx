import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function sizeClasses(count) {
  if (count >= 5) return { box: 'min-w-[7rem] px-3 py-3', text: 'text-sm', img: 'h-10' }
  if (count >= 2) return { box: 'min-w-[6rem] px-2.5 py-2.5', text: 'text-xs', img: 'h-8' }
  return { box: 'min-w-[5.5rem] px-2 py-2', text: 'text-xs', img: 'h-7' }
}

function CompanyTile({ company, onClick }) {
  const size = sizeClasses(company.alumni_count)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => onClick?.(company.id)}
          className={`relative flex flex-col items-center justify-center gap-1.5 rounded-lg border bg-background transition-colors hover:bg-muted/60 ${size.box}`}
        >
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className={`${size.img} w-auto max-w-[6rem] object-contain`}
            />
          ) : (
            <span className={`${size.text} max-w-[7rem] truncate font-semibold text-foreground`}>
              {company.name}
            </span>
          )}
          {company.alumni_count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {company.alumni_count}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{company.name}</p>
        <p className="text-xs text-muted-foreground">
          {company.alumni_count} {company.alumni_count === 1 ? 'egresso' : 'egressos'}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

export function LogoCluster({ logoCluster = [], onClick }) {
  return (
    <TooltipProvider>
      <div className="space-y-8">
        {logoCluster.map((sector) => (
          <div key={sector.id}>
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {sector.name}
              </h3>
              <span className="text-xs text-muted-foreground/60">
                {sector.companies.length} {sector.companies.length === 1 ? 'empresa' : 'empresas'}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-wrap items-start gap-3">
              {sector.companies.map((company) => (
                <CompanyTile key={company.id} company={company} onClick={onClick} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}
