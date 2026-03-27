import { useTrabalhoAlumni } from '@/hooks/useTrabalhoAlumni'
import { YouTubeEmbed } from '@/components/common/YouTubeEmbed'
import { Card, CardContent } from '@/components/ui/card'

export default function TrabalhoAlumni() {
  const { data: videos = [], isLoading } = useTrabalhoAlumni({ published: true })

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Trabalho Alumni</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Vídeos de egressos compartilhando suas experiências profissionais e trajetórias após a graduação.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">Carregando vídeos...</div>
      ) : videos.length === 0 ? (
        <div className="text-center text-muted-foreground">Nenhum vídeo publicado ainda.</div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
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
