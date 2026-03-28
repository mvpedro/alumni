import { Link, useParams } from 'react-router-dom'
import { useTrabalhoAlumniById } from '@/hooks/useTrabalhoAlumni'
import { useAuth } from '@/contexts/AuthContext'
import { YouTubeEmbed } from '@/components/common/YouTubeEmbed'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, UserCircle } from 'lucide-react'

export default function TrabalhoAlumniVideo() {
  const { id } = useParams()
  const { data: video, isLoading, isError } = useTrabalhoAlumniById(id)
  const { isAuthenticated, alumni } = useAuth()

  // Show opt-in CTA when the logged-in user has NOT set open_to_trabalho_alumni
  const showOptInCta = isAuthenticated && alumni != null && !alumni.open_to_trabalho_alumni

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="mb-6 h-4 w-32" />
        <Skeleton className="mb-4 aspect-video w-full rounded-xl" />
        <Skeleton className="mb-2 h-7 w-2/3" />
        <Skeleton className="mb-1 h-4 w-1/4" />
        <Skeleton className="mt-4 h-20 w-full" />
      </div>
    )
  }

  if (isError || !video) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="text-muted-foreground">Vídeo não encontrado.</p>
        <Link to="/trabalho-alumni" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Voltar para Trabalho Alumni
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      {/* Back link */}
      <Link
        to="/trabalho-alumni"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Trabalho Alumni
      </Link>

      {/* YouTube embed */}
      <div className="mb-6 overflow-hidden rounded-xl">
        <YouTubeEmbed url={video.youtube_url} title={video.title} />
      </div>

      {/* Title + semester */}
      <div className="mb-4 flex flex-wrap items-start gap-3">
        {video.title && (
          <h1 className="flex-1 text-2xl font-bold leading-snug">{video.title}</h1>
        )}
        {video.semester && (
          <Badge variant="secondary" className="shrink-0">
            {video.semester}
          </Badge>
        )}
      </div>

      {/* Description */}
      {video.description && (
        <p className="mb-8 text-muted-foreground">{video.description}</p>
      )}

      {/* Alumni CTA card */}
      {video.alumni && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-4">
            {video.alumni.avatar_url ? (
              <img
                src={video.alumni.avatar_url}
                alt={video.alumni.full_name}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <UserCircle className="h-8 w-8 text-primary/60" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">
                Obrigado{' '}
                <span className="font-semibold text-foreground">{video.alumni.full_name}</span>{' '}
                por participar do Trabalho Alumni!
              </p>
              <Link
                to={`/perfil/${video.alumni.id}`}
                className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
              >
                Ver perfil →
              </Link>
            </div>
          </div>

          {showOptInCta && (
            <div className="mt-4 border-t border-primary/10 pt-4">
              <p className="mb-3 text-sm text-muted-foreground">
                Quer ser entrevistado no próximo Trabalho Alumni?
              </p>
              <Button asChild size="sm" variant="default">
                <Link to="/perfil">Atualizar preferências</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
