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
    <Card className="h-full transition-shadow hover:shadow-md">
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
            <p className="truncate font-semibold">
              {anonymous ? 'Alumni Automação' : alumni.full_name}
            </p>
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

        {alumni.open_to_mentoring && (
          <div className="mt-3">
            <Badge variant="secondary" className="text-xs">Mentor disponível</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (anonymous) return <div className="block">{content}</div>

  return <Link to={`/perfil/${alumni.id}`} className="block">{content}</Link>
}
