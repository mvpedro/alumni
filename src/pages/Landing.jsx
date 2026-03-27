import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PostCard } from '@/components/blog/PostCard'
import { Skeleton } from '@/components/ui/skeleton'

function useLandingStats() {
  return useQuery({
    queryKey: ['landing-stats'],
    queryFn: async () => {
      const [alumniRes, companiesRes, sectorsRes] = await Promise.all([
        supabase.from('alumni').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('sectors').select('id', { count: 'exact', head: true }),
      ])
      return {
        alumni: alumniRes.count ?? 0,
        companies: companiesRes.count ?? 0,
        sectors: sectorsRes.count ?? 0,
      }
    },
  })
}

function useRecentPosts() {
  return useQuery({
    queryKey: ['recent-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select('id, title, slug, excerpt, cover_image_url, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3)
      if (error) throw error
      return data
    },
  })
}

const stats = [
  { key: 'alumni', label: 'Alumni cadastrados' },
  { key: 'companies', label: 'Empresas representadas' },
  { key: 'sectors', label: 'Setores de atuação' },
]

const features = [
  {
    title: 'Banco de Dados',
    description: 'Encontre colegas egressos, filtre por setor, empresa ou cidade e conecte-se com mentores.',
    to: '/banco-de-dados',
    cta: 'Explorar alumni',
  },
  {
    title: 'Mapa dos Egressos',
    description: 'Visualize a distribuição dos egressos por empresa, setor e região do Brasil.',
    to: '/mapa-dos-egressos',
    cta: 'Ver mapa',
  },
  {
    title: 'Contato',
    description: 'Entre em contato com a coordenação do curso ou com a rede de alumni.',
    to: '/contato',
    cta: 'Entrar em contato',
  },
]

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const { data: statsData, isLoading } = useLandingStats()
  const { data: recentPosts = [] } = useRecentPosts()

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 py-24 text-center sm:py-28">
        <div className="container mx-auto px-4">
          <img src="/alumni-logo.png" alt="" className="mx-auto mb-6 h-24 w-auto" />
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Alumni Automação UFSC
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            A rede de egressos do curso de Engenharia de Controle e Automação da UFSC. Conecte-se, explore trajetórias e inspire-se.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                  <Link to="/banco-de-dados">Ver Banco de Dados</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Link to="/perfil">Meu Perfil</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                  <Link to="/cadastro">Cadastre-se</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Link to="/mapa-dos-egressos">Ver Mapa</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.key} className="text-center">
                {isLoading ? (
                  <Skeleton className="mx-auto mb-1 h-10 w-20" />
                ) : (
                  <p className="text-4xl font-bold text-foreground">{statsData?.[stat.key] ?? 0}</p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight">Explore a rede</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feat) => (
              <Card key={feat.to} className="flex flex-col transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardTitle className="text-lg">{feat.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  <p className="text-sm text-muted-foreground">{feat.description}</p>
                  <Link
                    to={feat.to}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {feat.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Interviews */}
      {recentPosts.length > 0 && (
        <section className="border-t bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Últimas Entrevistas</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Conversas com egressos sobre suas trajetórias.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <Link to="/entrevistas">
                  Ver todas
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Button asChild variant="outline" size="sm">
                <Link to="/entrevistas">
                  Ver todas as entrevistas
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
