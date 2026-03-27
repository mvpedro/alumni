import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, MapPin, Building2, ArrowRight, LayoutGrid, Newspaper } from 'lucide-react'
import { supabase } from '@/lib/supabase'
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
  { key: 'alumni', label: 'Alumni cadastrados', icon: Users },
  { key: 'companies', label: 'Empresas representadas', icon: Building2 },
  { key: 'sectors', label: 'Setores de atuação', icon: LayoutGrid },
]

const features = [
  {
    icon: Users,
    title: 'Banco de Dados',
    description: 'Encontre colegas egressos, filtre por setor, empresa ou cidade e conecte-se com mentores.',
    to: '/banco-de-dados',
    cta: 'Explorar alumni',
  },
  {
    icon: MapPin,
    title: 'Mapa dos Egressos',
    description: 'Visualize a distribuição dos egressos por empresa, setor e região do Brasil.',
    to: '/mapa-dos-egressos',
    cta: 'Ver mapa',
  },
  {
    icon: Building2,
    title: 'Contato',
    description: 'Entre em contato com a coordenação do curso ou com a rede de alumni.',
    to: '/contato',
    cta: 'Entrar em contato',
  },
]

export default function Landing() {
  const { data: statsData, isLoading } = useLandingStats()
  const { data: recentPosts = [] } = useRecentPosts()

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-24 text-center sm:py-28">
        <div className="container mx-auto px-4">
          <img src="/alumni-logo.png" alt="" className="mx-auto mb-6 h-24 w-auto" />
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
            Alumni Automação UFSC
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            A rede de egressos do curso de Engenharia de Controle e Automação da UFSC. Conecte-se, explore trajetórias e inspire-se.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/cadastro">Cadastre-se</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/mapa-dos-egressos">Ver Mapa</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.key}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    {isLoading ? (
                      <Skeleton className="mb-1 h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold">{statsData?.[stat.key] ?? 0}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
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
              <Card key={feat.to} className="flex flex-col transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <feat.icon className="h-5 w-5" />
                  </div>
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
