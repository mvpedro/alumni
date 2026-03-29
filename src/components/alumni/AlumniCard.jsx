import { Link } from 'react-router-dom'
import { Building2, MapPin, GraduationCap, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function AlumniCard({ alumni, anonymous = false }) {
  const initials = alumni.full_name
    ? alumni.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const location = [alumni.city, alumni.state].filter(Boolean).join(', ')

  const content = (
    <Card className="h-full border transition-all hover:shadow-md hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            {anonymous ? (
              <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
            ) : (
              <>
                <AvatarImage src={alumni.avatar_url} alt={alumni.full_name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-semibold">
                {anonymous ? 'Alumni Automação' : alumni.full_name}
              </p>
              {!anonymous && alumni.is_graduando && (
                <Badge className="shrink-0 bg-indigo-100 text-indigo-800 hover:bg-indigo-100 text-xs dark:bg-indigo-900/30 dark:text-indigo-400">
                  Graduando
                </Badge>
              )}
            </div>
            {alumni.job_title && (
              <p className="truncate text-sm text-muted-foreground">{alumni.job_title}</p>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {alumni.company?.name && (
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{alumni.company.name}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          {alumni.entry_class && (
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span>Turma {alumni.entry_class}</span>
            </div>
          )}
        </div>

        {(alumni.is_hiring || alumni.open_to_mentoring) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {alumni.is_hiring && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs dark:bg-green-900/30 dark:text-green-400">
                Contratando
              </Badge>
            )}
            {alumni.open_to_mentoring && (
              <Badge variant="secondary" className="text-xs">Mentor disponível</Badge>
            )}
          </div>
        )}

        {alumni.alumni_badges && alumni.alumni_badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {alumni.alumni_badges.slice(0, 3).map((ab) => {
              const badge = ab.badge
              if (!badge) return null
              const color = badge.color ?? '#0d9488'
              return (
                <span
                  key={badge.slug}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `${color}15`,
                    color: color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {badge.name}
                </span>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (anonymous) return <div className="block">{content}</div>

  return <Link to={`/perfil/${alumni.id}`} className="block">{content}</Link>
}
