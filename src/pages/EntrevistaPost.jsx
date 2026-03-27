import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useInterview } from '@/hooks/useInterviews'
import { PostContent } from '@/components/blog/PostContent'
import { ArrowLeft } from 'lucide-react'

export default function EntrevistaPost() {
  const { slug } = useParams()
  const { data: post, isLoading, isError } = useInterview(slug)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground">Carregando...</p>
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
        </div>
      </div>
    </>
  )
}
