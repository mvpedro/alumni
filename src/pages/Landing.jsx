import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, MapPin, Building2, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function useLandingStats() {
  return useQuery({
    queryKey: ['landing-stats'],
    queryFn: async () => {
      const [alumniRes, companiesRes, sectorsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
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
  const { data: stats, isLoading } = useLandingStats()

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-background py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
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
      <section className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-3 text-center">
            <div>
              <p className="text-4xl font-bold text-primary">
                {isLoading ? '—' : stats?.alumni}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Alumni cadastrados</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">
                {isLoading ? '—' : stats?.companies}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Empresas representadas</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">
                {isLoading ? '—' : stats?.sectors}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Setores de atuação</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center text-2xl font-bold">Explore a rede</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feat) => (
              <Card key={feat.to} className="flex flex-col">
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
    </div>
  )
}
