import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Combobox } from '@/components/common/Combobox'
import { useUnlinkedAlumni, useLinkAlumni, useUnlinkAlumni } from '@/hooks/useAdminLink'
import { toast } from 'sonner'

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
        .select('id, full_name, entry_class, status, is_admin, user_type, created_at, alumni:alumni!alumni_profile_id_fkey(id, full_name, contact_email, is_graduando)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

function LinkAlumniDialog({ open, onOpenChange, user }) {
  const [selectedAlumniId, setSelectedAlumniId] = useState('')
  const { data: unlinkedAlumni = [], isLoading: loadingUnlinked } = useUnlinkedAlumni()
  const linkMutation = useLinkAlumni()
  const unlinkMutation = useUnlinkAlumni()

  const linkedAlumni = user?.alumni

  const comboOptions = unlinkedAlumni.map((a) => ({
    value: a.id,
    label: [
      a.full_name,
      a.entry_class ? `(${a.entry_class})` : null,
      a.contact_email ? `— ${a.contact_email}` : null,
    ]
      .filter(Boolean)
      .join(' '),
  }))

  async function handleLink() {
    if (!selectedAlumniId) return
    try {
      await linkMutation.mutateAsync({ alumniId: selectedAlumniId, profileId: user.id })
      toast.success('Usuário vinculado ao egresso com sucesso.')
      setSelectedAlumniId('')
      onOpenChange(false)
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao vincular usuário.')
    }
  }

  async function handleUnlink() {
    try {
      await unlinkMutation.mutateAsync(linkedAlumni.id)
      toast.success('Vínculo removido com sucesso.')
      onOpenChange(false)
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao desvincular usuário.')
    }
  }

  function handleOpenChange(val) {
    if (!val) setSelectedAlumniId('')
    onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vínculo de perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm text-muted-foreground">Usuário</p>
            <p className="font-medium">{user?.full_name || '—'}</p>
          </div>

          {linkedAlumni ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Vinculado a</p>
                <p className="font-medium">{linkedAlumni.full_name}</p>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleUnlink}
                  disabled={unlinkMutation.isPending}
                >
                  Desvincular
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-sm text-muted-foreground">
                  Selecione um egresso sem vínculo
                </p>
                <Combobox
                  options={comboOptions}
                  value={selectedAlumniId}
                  onChange={setSelectedAlumniId}
                  placeholder={loadingUnlinked ? 'Carregando...' : 'Selecionar egresso...'}
                  searchPlaceholder="Buscar por nome ou e-mail..."
                  emptyMessage="Nenhum egresso disponível."
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={handleLink}
                  disabled={!selectedAlumniId || linkMutation.isPending}
                >
                  Vincular
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Usuarios() {
  const { data: users = [], isLoading } = useUsers()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [linkDialogUser, setLinkDialogUser] = useState(null)

  const filtered = users.filter((u) => {
    const matchesSearch =
      search === '' ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.alumni?.contact_email?.toLowerCase().includes(search.toLowerCase())
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
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Admin</TableHead>
              <TableHead className="hidden lg:table-cell">Vínculo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="space-y-1"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-36" /></div></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.full_name || '—'}</div>
                    {user.alumni?.contact_email && (
                      <div className="text-xs text-muted-foreground">{user.alumni.contact_email}</div>
                    )}
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
                    {user.user_type === 'graduando' ? (
                      <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400">
                        Graduando
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Egresso</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.is_admin ? (
                      <Badge variant="outline">Admin</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <button
                      className="text-left hover:underline focus:outline-none"
                      onClick={() => setLinkDialogUser(user)}
                    >
                      {user.alumni?.full_name ? (
                        <span className="text-sm">{user.alumni.full_name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sem vínculo</span>
                      )}
                    </button>
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

      <LinkAlumniDialog
        open={!!linkDialogUser}
        onOpenChange={(val) => { if (!val) setLinkDialogUser(null) }}
        user={linkDialogUser}
      />
    </div>
  )
}
