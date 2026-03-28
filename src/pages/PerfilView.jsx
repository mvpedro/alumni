import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Building2, MapPin, GraduationCap, ExternalLink, Mail, BookOpen, Briefcase, Clapperboard } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { YouTubeEmbed } from '@/components/common/YouTubeEmbed'
import { BadgeDisplay } from '@/components/alumni/BadgeDisplay'
import { useAlumniBadges } from '@/hooks/useBadges'

function usePublicProfile(id) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alumni')
        .select('*, company:companies(id, name, logo_url, sector:sectors(id, name))')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

function useParticipations(alumniId) {
  return useQuery({
    queryKey: ['participations', alumniId],
    queryFn: async () => {
      const [interviewsRes, videosRes] = await Promise.all([
        supabase
          .from('interviews')
          .select('id, title, slug, published_at')
          .eq('alumni_id', alumniId)
          .eq('published', true)
          .order('published_at', { ascending: false }),
        supabase
          .from('trabalho_alumni')
          .select('id, title, youtube_url, semester')
          .eq('alumni_id', alumniId)
          .eq('published', true)
          .order('semester', { ascending: false }),
      ])
      if (interviewsRes.error) throw interviewsRes.error
      if (videosRes.error) throw videosRes.error
      return {
        interviews: interviewsRes.data ?? [],
        videos: videosRes.data ?? [],
      }
    },
    enabled: !!alumniId,
  })
}

export default function PerfilView() {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const { data: profile, isLoading, isError } = usePublicProfile(id)
  const { data: participations } = useParticipations(id)
  const { data: alumniBadges = [] } = useAlumniBadges(id)

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="mb-6 h-8 w-36" />
        <div className="rounded-xl border p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-xl border p-6">
          <Skeleton className="mb-3 h-5 w-16" />
          <Skeleton className="h-20 w-full" />
        </div>
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
    <div className="container mx-auto max-w-3xl px-4 py-10">
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
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                {profile.is_hiring && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                    Contratando
                  </Badge>
                )}
              </div>
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

              {alumniBadges.length > 0 && (
                <div className="mt-3">
                  <BadgeDisplay badges={alumniBadges} />
                </div>
              )}

              {isAdmin && (profile.open_to_trabalho_alumni || profile.open_to_text_interview || profile.open_to_alumni_talk || profile.open_to_semana_academica) && (
                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Disponível para</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.open_to_trabalho_alumni && (
                      <Badge variant="outline" className="border-teal-500 text-teal-600 dark:text-teal-400">Trabalho Alumni</Badge>
                    )}
                    {profile.open_to_text_interview && (
                      <Badge variant="outline" className="border-teal-500 text-teal-600 dark:text-teal-400">Entrevista em texto</Badge>
                    )}
                    {profile.open_to_alumni_talk && (
                      <Badge variant="outline" className="border-teal-500 text-teal-600 dark:text-teal-400">Alumni Talk</Badge>
                    )}
                    {profile.open_to_semana_academica && (
                      <Badge variant="outline" className="border-teal-500 text-teal-600 dark:text-teal-400">Semana Acadêmica</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact links — respect visibility preferences */}
          {((profile.linkedin_url && profile.show_linkedin !== false) ||
            (profile.contact_email && profile.show_email)) && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-3">
                {profile.linkedin_url && profile.show_linkedin !== false && (
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
                {profile.contact_email && profile.show_email && (
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

      {/* Skills + Interests + Extracurriculars */}
      {(profile.skills?.length > 0 || profile.interests?.length > 0 || profile.extracurriculars?.length > 0) && (
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
              {profile.extracurriculars?.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Atividades extracurriculares</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.extracurriculars.map((item) => (
                      <Badge key={item} variant="secondary">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* International experience */}
      {profile.has_international_experience && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Experiência Internacional</h3>
            {profile.international_experience_type && (
              <p className="text-sm font-medium">{profile.international_experience_type}</p>
            )}
            {profile.international_experience_detail && (
              <p className="mt-1 text-sm text-muted-foreground">{profile.international_experience_detail}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Career History */}
      {careerHistory.length > 0 && (
        <Card className="mb-6">
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

      {/* Participações */}
      {participations && (participations.interviews.length > 0 || participations.videos.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clapperboard className="h-4 w-4" />
              Participações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {participations.interviews.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Entrevistas</h3>
                <ul className="space-y-2">
                  {participations.interviews.map((interview) => (
                    <li key={interview.id}>
                      <Link
                        to={`/entrevistas/${interview.slug}`}
                        className="text-sm font-medium hover:underline text-primary"
                      >
                        {interview.title}
                      </Link>
                      {interview.published_at && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {new Date(interview.published_at).toLocaleDateString('pt-BR', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {participations.videos.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Trabalho Alumni
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  {participations.videos.map((video) => (
                    <div key={video.id}>
                      <YouTubeEmbed url={video.youtube_url} title={video.title} />
                      {video.title && (
                        <p className="mt-2 text-sm font-medium leading-snug">{video.title}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
