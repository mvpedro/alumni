import { useInterviews } from '@/hooks/useInterviews'
import { PostCard } from '@/components/blog/PostCard'

export default function Entrevistas() {
  const { data: posts = [], isLoading } = useInterviews({ published: true })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold">Entrevistas</h1>
        <p className="text-muted-foreground">
          Conversas com egressos sobre suas trajetórias profissionais e acadêmicas.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma entrevista publicada ainda.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
