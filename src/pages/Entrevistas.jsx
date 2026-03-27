import { useInterviews } from '@/hooks/useInterviews'
import { PostCard } from '@/components/blog/PostCard'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Newspaper } from 'lucide-react'

export default function Entrevistas() {
  const { data: posts = [], isLoading } = useInterviews({ published: true })

  return (
    <div className="container mx-auto px-4 py-10">
      <PageHeader
        title="Entrevistas"
        description="Conversas com egressos sobre suas trajetórias profissionais e acadêmicas."
      />

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Nenhuma entrevista publicada"
          description="Em breve publicaremos conversas com egressos do curso."
        />
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
