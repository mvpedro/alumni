import { Link } from 'react-router-dom'
import { useTrabalhoAlumni } from '@/hooks/useTrabalhoAlumni'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Video } from 'lucide-react'

function getYouTubeId(url) {
  const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] ?? null
}

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
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border">
                    <Skeleton className="aspect-video w-full rounded-none" />
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-4 w-3/4" />
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
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {semVideos.map((video) => {
                  const videoId = getYouTubeId(video.youtube_url)
                  return (
                    <Link
                      key={video.id}
                      to={`/trabalho-alumni/${video.id}`}
                      className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        {videoId ? (
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                            alt={video.title ?? 'Vídeo'}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 translate-x-0.5">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        {video.title && (
                          <p className="mb-1 line-clamp-2 text-sm font-semibold leading-snug">
                            {video.title}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          {video.alumni?.full_name && (
                            <span className="truncate text-xs text-muted-foreground">
                              {video.alumni.full_name}
                            </span>
                          )}
                          {video.semester && (
                            <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
                              {video.semester}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
