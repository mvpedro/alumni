import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserActions } from '@/components/admin/UserActions'

const statusVariant = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
}

const statusLabel = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
}

function useUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, company:companies!profiles_company_id_fkey(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export default function Usuarios() {
  const { data: users = [], isLoading } = useUsers()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = users.filter((u) => {
    const matchesSearch =
      search === '' ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Usuários</h1>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Turma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Admin</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.full_name || '—'}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.entry_class || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[user.status] ?? 'outline'}>
                      {statusLabel[user.status] ?? user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.is_admin ? (
                      <Badge variant="outline">Admin</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActions user={user} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
