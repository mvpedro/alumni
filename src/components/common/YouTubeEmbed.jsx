function extractVideoId(url) {
  if (!url) return null
  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
  if (shortMatch) return shortMatch[1]
  // youtube.com/embed/ID
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/)
  if (embedMatch) return embedMatch[1]
  // youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([^&]+)/)
  if (watchMatch) return watchMatch[1]
  return null
}

export function YouTubeEmbed({ url, title }) {
  const videoId = extractVideoId(url)

  if (!videoId) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">URL inválida</p>
      </div>
    )
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title ?? 'YouTube video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}
