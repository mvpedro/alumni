import { ExternalLink, Mic, Video } from 'lucide-react'
import { usePalestras } from '@/hooks/usePalestras'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

function getYouTubeId(url) {
  const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] ?? null
}

function VideoCard({ palestra }) {
  const videoId = getYouTubeId(palestra.youtube_url)

  return (
    <a
      href={palestra.youtube_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {videoId ? (
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={palestra.title ?? 'Vídeo'}
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
        {/* External link indicator */}
        <div className="absolute right-2 top-2 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
          <ExternalLink className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
      <div className="p-3">
        {palestra.title && (
          <p className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug">
            {palestra.title}
          </p>
        )}
        <div className="flex items-center gap-2">
          {palestra.alumni?.full_name && (
            <span className="truncate text-xs text-muted-foreground">
              {palestra.alumni.full_name}
            </span>
          )}
          {palestra.event_name && !palestra.alumni?.full_name && (
            <span className="truncate text-xs text-muted-foreground">
              {palestra.event_name}
            </span>
          )}
        </div>
        {palestra.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {palestra.description}
          </p>
        )}
      </div>
    </a>
  )
}

function SectionSkeleton() {
  return (
    <div>
      <Skeleton className="mb-4 h-7 w-48" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
  )
}

export default function Palestras() {
  const { data: alumniTalks = [], isLoading: loadingTalks } = usePalestras({ category: 'alumni_talk' })
  const { data: eventos = [], isLoading: loadingEventos } = usePalestras({ category: 'evento' })

  const isLoading = loadingTalks || loadingEventos
  const isEmpty = !isLoading && alumniTalks.length === 0 && eventos.length === 0

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      {/* Hero section */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Palestras & Alumni Talks</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Palestras, talks e eventos com egressos de Engenharia de Controle e Automação compartilhando
          suas experiências profissionais, trajetórias e perspectivas sobre o mercado de trabalho.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-12">
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={Mic}
          title="Nenhuma palestra publicada"
          description="Em breve publicaremos palestras e Alumni Talks com egressos do curso."
        />
      ) : (
        <div className="space-y-14">
          {alumniTalks.length > 0 && (
            <section>
              <div className="mb-5 flex items-center gap-2">
                <h2 className="text-xl font-semibold">Alumni Talks</h2>
                <Badge variant="secondary" className="text-xs">{alumniTalks.length}</Badge>
              </div>
              <p className="mb-6 -mt-2 text-sm text-muted-foreground">
                Egressos compartilhando suas trajetórias e experiências no Alumni Talks.
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {alumniTalks.map((palestra) => (
                  <VideoCard key={palestra.id} palestra={palestra} />
                ))}
              </div>
            </section>
          )}

          {eventos.length > 0 && (
            <section>
              <div className="mb-5 flex items-center gap-2">
                <h2 className="text-xl font-semibold">Eventos</h2>
                <Badge variant="secondary" className="text-xs">{eventos.length}</Badge>
              </div>
              <p className="mb-6 -mt-2 text-sm text-muted-foreground">
                Palestras e painéis em eventos acadêmicos com participação de alumni.
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {eventos.map((palestra) => (
                  <VideoCard key={palestra.id} palestra={palestra} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
