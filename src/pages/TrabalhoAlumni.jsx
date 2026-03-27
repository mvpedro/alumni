import { useTrabalhoAlumni } from '@/hooks/useTrabalhoAlumni'
import { YouTubeEmbed } from '@/components/common/YouTubeEmbed'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Video } from 'lucide-react'

export default function TrabalhoAlumni() {
  const { data: videos = [], isLoading } = useTrabalhoAlumni({ published: true })

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Trabalho Alumni</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Vídeos de egressos compartilhando suas experiências profissionais e trajetórias após a graduação.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-8 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
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
        <div className="grid gap-8 lg:grid-cols-2">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <YouTubeEmbed url={video.youtube_url} title={video.title} />
              <CardContent className="pt-4">
                {video.title && (
                  <h2 className="mb-1 font-semibold leading-snug">{video.title}</h2>
                )}
                {video.description && (
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
