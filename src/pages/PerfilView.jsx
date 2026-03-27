import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Building2, MapPin, GraduationCap, ExternalLink, Mail, BookOpen, Briefcase } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

function usePublicProfile(id) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, company:companies!profiles_company_id_fkey(id, name, logo_url, sector:sectors(id, name))')
        .eq('id', id)
        .eq('status', 'approved')
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export default function PerfilView() {
  const { id } = useParams()
  const { data: profile, isLoading, isError } = usePublicProfile(id)

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-muted-foreground">Perfil não encontrado.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/banco-de-dados">Voltar ao Banco de Dados</Link>
        </Button>
      </div>
    )
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ')

  const careerHistory = Array.isArray(profile.career_history) ? profile.career_history : []

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link to="/banco-de-dados">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Banco de Dados
        </Link>
      </Button>

      {/* Header card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              {profile.job_title && (
                <p className="text-muted-foreground">{profile.job_title}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {profile.company?.name && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    <span>{profile.company.name}</span>
                    {profile.company.sector?.name && (
                      <span className="text-xs">({profile.company.sector.name})</span>
                    )}
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                  </div>
                )}
                {profile.entry_class && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    <span>Entrada {profile.entry_class}</span>
                  </div>
                )}
                {profile.graduation_class && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    <span>Formatura {profile.graduation_class}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {profile.open_to_mentoring && (
                  <Badge variant="secondary">Disponível para mentoria</Badge>
                )}
                {profile.open_to_contact && (
                  <Badge variant="outline">Aberto para contato</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact links */}
          {(profile.linkedin_url || profile.contact_email) && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-3">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      LinkedIn
                    </Button>
                  </a>
                )}
                {profile.contact_email && (
                  <a href={`mailto:${profile.contact_email}`}>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      {profile.contact_email}
                    </Button>
                  </a>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bio */}
      {profile.bio && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Sobre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills + Interests */}
      {(profile.skills?.length > 0 || profile.interests?.length > 0) && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.skills?.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Habilidades</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.interests?.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Interesses</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((interest) => (
                      <Badge key={interest} variant="outline">{interest}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career History */}
      {careerHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4" />
              Histórico profissional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l border-border pl-6 space-y-4">
              {careerHistory.map((entry, i) => (
                <li key={i} className="relative">
                  <div className="absolute -left-[25px] flex h-4 w-4 items-center justify-center rounded-full bg-background ring-2 ring-border">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <p className="font-medium">{entry.title}</p>
                  {entry.company && (
                    <p className="text-sm text-muted-foreground">{entry.company}</p>
                  )}
                  {(entry.start || entry.end) && (
                    <p className="text-xs text-muted-foreground">
                      {entry.start}{entry.start && entry.end ? ' – ' : ''}{entry.end || (entry.start ? 'atual' : '')}
                    </p>
                  )}
                  {entry.description && (
                    <p className="mt-1 text-sm">{entry.description}</p>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
