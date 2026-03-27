import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function logoSizeClass(count) {
  if (count >= 5) return 'h-16'
  if (count >= 2) return 'h-12'
  return 'h-10'
}

export function LogoCluster({ logoCluster = [], onClick }) {
  return (
    <TooltipProvider>
      <div className="space-y-8">
        {logoCluster.map((sector) => (
          <div key={sector.id}>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {sector.name}
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              {sector.companies.map((company) => (
                <Tooltip key={company.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onClick?.(company.id)}
                      className="flex items-center justify-center rounded-md border bg-background p-2 transition-shadow hover:shadow-md"
                    >
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company.name}
                          className={`${logoSizeClass(company.alumni_count)} w-auto object-contain`}
                        />
                      ) : (
                        <div className={`${logoSizeClass(company.alumni_count)} flex w-24 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground`}>
                          {company.name}
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-xs">
                      {company.alumni_count} {company.alumni_count === 1 ? 'alumni' : 'alumni'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}
