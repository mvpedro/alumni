import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'

export function PostCard({ post }) {
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <Link to={`/entrevistas/${post.slug}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        {/* Cover image or gradient placeholder */}
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-teal-500 to-teal-700" />
        )}

        <CardContent className="p-4">
          <h2 className="mb-1 line-clamp-2 font-semibold leading-snug group-hover:text-primary">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
          {publishedDate && (
            <p className="text-xs text-muted-foreground">{publishedDate}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
