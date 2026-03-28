import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useInterview } from '@/hooks/useInterviews'
import { useAuth } from '@/contexts/AuthContext'
import { PostContent } from '@/components/blog/PostContent'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User } from 'lucide-react'

export default function EntrevistaPost() {
  const { slug } = useParams()
  const { data: post, isLoading, isError } = useInterview(slug)
  const { isAuthenticated, isApproved } = useAuth()
  const alumniMatch = post?.alumni ?? null

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="mb-8 h-4 w-40" />
        <Skeleton className="mb-8 h-64 w-full rounded-lg" />
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="mb-2 text-2xl font-bold">Entrevista não encontrada</h1>
        <Link to="/entrevistas" className="text-sm text-primary hover:underline">
          ← Voltar para entrevistas
        </Link>
      </div>
    )
  }

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const intervieweeName = post.title?.replace(/^Entrevista:\s*/i, '').trim()

  return (
    <>
      <Helmet>
        <title>{post.title} | Alumni Automação UFSC</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <Link
          to="/entrevistas"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para entrevistas
        </Link>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="mb-8 w-full rounded-lg object-cover"
            style={{ maxHeight: '24rem' }}
          />
        )}

        <div className="mx-auto max-w-3xl">
          <h1 className="mb-2 text-3xl font-bold leading-tight">{post.title}</h1>
          {publishedDate && (
            <p className="mb-8 text-sm text-muted-foreground">{publishedDate}</p>
          )}

          <PostContent content={post.content ?? ''} />

          {/* CTA to alumni profile */}
          <div className="mt-12 rounded-xl border bg-muted/30 p-6 text-center">
            {alumniMatch && isAuthenticated && isApproved ? (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  Quer saber mais sobre {intervieweeName}?
                </p>
                <Link to={`/perfil/${alumniMatch.id}`}>
                  <Button>
                    <User className="mr-2 h-4 w-4" />
                    Ver perfil de {alumniMatch.full_name}
                  </Button>
                </Link>
              </>
            ) : alumniMatch && !isAuthenticated ? (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  Quer saber mais sobre {intervieweeName}? Faça login para ver o perfil completo.
                </p>
                <Link to="/login">
                  <Button variant="outline">Entrar para ver perfil</Button>
                </Link>
              </>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  Gostou desta entrevista? Explore mais histórias de egressos.
                </p>
                <Link to="/entrevistas">
                  <Button variant="outline">Ver mais entrevistas</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
