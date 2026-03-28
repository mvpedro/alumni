import { Link } from 'react-router-dom'
import { useTrabalhoAlumni } from '@/hooks/useTrabalhoAlumni'
import { useAuth } from '@/contexts/AuthContext'
import { YouTubeEmbed } from '@/components/common/YouTubeEmbed'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Video } from 'lucide-react'

// Group videos by semester, preserving descending order
function groupBySemester(videos) {
  const map = new Map()
  for (const video of videos) {
    const key = video.semester ?? 'Sem semestre'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(video)
  }
  return map
}

export default function TrabalhoAlumni() {
  const { data: videos = [], isLoading } = useTrabalhoAlumni({ published: true })
  const { isAuthenticated, isApproved } = useAuth()

  const grouped = groupBySemester(videos)

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      {/* Hero section */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Trabalho Alumni</h1>
        <p className="mt-1 text-lg text-muted-foreground font-medium">Entrevista Calouros Automação</p>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          O Trabalho Alumni é um projeto da disciplina de Introdução à Engenharia de Controle e
          Automação onde grupos de calouros entrevistam egressos do curso. As entrevistas são
          gravadas em vídeo e publicadas para que toda a comunidade possa conhecer as trajetórias
          profissionais dos nossos alumni.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-10">
          {Array.from({ length: 2 }).map((_, s) => (
            <div key={s}>
              <Skeleton className="mb-4 h-6 w-36" />
              <div className="grid gap-8 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border">
                    <Skeleton className="aspect-video w-full rounded-none" />
                    <div className="space-y-2 p-4">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon={Video}
          title="Nenhum vídeo publicado"
          description="Em breve publicaremos vídeos de egressos compartilhando suas experiências."
        />
      ) : (
        <div className="space-y-12">
          {[...grouped.entries()].map(([semester, semVideos]) => (
            <section key={semester}>
              <h2 className="mb-5 text-xl font-semibold">
                {semester === 'Sem semestre' ? semester : `Semestre ${semester}`}
              </h2>
              <div className="grid gap-8 lg:grid-cols-2">
                {semVideos.map((video) => (
                  <Card key={video.id} className="overflow-hidden transition-shadow hover:shadow-md">
                    <YouTubeEmbed url={video.youtube_url} title={video.title} />
                    <CardContent className="pt-4">
                      {video.title && (
                        <h3 className="mb-1 font-semibold leading-snug">{video.title}</h3>
                      )}
                      {video.description && (
                        <p className="mb-2 text-sm text-muted-foreground">{video.description}</p>
                      )}
                      {video.alumni && isAuthenticated && isApproved && (
                        <Link
                          to={`/perfil/${video.alumni.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Ver perfil de {video.alumni.full_name}
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
