import { Building2, ChevronRight, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AREA_LABELS, JOB_TYPE_LABELS, WORK_MODE_LABELS, companyLabel } from '@/hooks/useOportunidades'

export function CompanyLogo({ op, className = 'h-12 w-12' }) {
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white ${className}`}>
      {op.company?.logo_url ? (
        <img src={op.company.logo_url} alt={companyLabel(op)} className="h-full w-full object-contain p-1.5" loading="lazy" />
      ) : (
        <Building2 className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  )
}

export function OportunidadeCard({ op, onClick }) {
  return (
    <button type="button" onClick={onClick} className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className="border transition-all hover:shadow-md hover:border-primary/20">
        <CardContent className="flex items-center gap-4 p-4">
          <CompanyLogo op={op} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{op.title}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 truncate">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                {companyLabel(op)}
              </span>
              {op.location && (
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {op.location}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{JOB_TYPE_LABELS[op.job_type]}</Badge>
              <Badge variant="secondary">{WORK_MODE_LABELS[op.work_mode]}</Badge>
              <Badge variant="outline">{AREA_LABELS[op.area]}</Badge>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </button>
  )
}
