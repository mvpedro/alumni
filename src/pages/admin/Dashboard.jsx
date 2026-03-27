import { useQuery } from '@tanstack/react-query'
import { Users, Clock, Building2, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async () => {
      const [profilesRes, pendingRes, companiesRes, messagesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase
          .from('contact_messages')
          .select('id', { count: 'exact', head: true })
          .eq('read', false),
      ])

      return {
        totalProfiles: profilesRes.count ?? 0,
        pendingApprovals: pendingRes.count ?? 0,
        totalCompanies: companiesRes.count ?? 0,
        unreadMessages: messagesRes.count ?? 0,
      }
    },
  })
}

function StatCard({ title, value, icon: Icon, highlight, loading }) {
  return (
    <Card className={cn(highlight && 'border-yellow-400 dark:border-yellow-500')}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', highlight ? 'text-yellow-500' : 'text-muted-foreground')} />
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-bold', highlight && 'text-yellow-600 dark:text-yellow-400')}>
          {loading ? '—' : value}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de perfis"
          value={stats?.totalProfiles}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title="Aprovações pendentes"
          value={stats?.pendingApprovals}
          icon={Clock}
          highlight={(stats?.pendingApprovals ?? 0) > 0}
          loading={isLoading}
        />
        <StatCard
          title="Empresas cadastradas"
          value={stats?.totalCompanies}
          icon={Building2}
          loading={isLoading}
        />
        <StatCard
          title="Mensagens não lidas"
          value={stats?.unreadMessages}
          icon={Mail}
          loading={isLoading}
        />
      </div>
    </div>
  )
}
