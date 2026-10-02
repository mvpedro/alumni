import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAllOportunidades,
  useCreateOportunidade,
  useUpdateOportunidade,
  useDeleteOportunidade,
  STATUS_LABELS,
  JOB_TYPE_LABELS,
  companyLabel,
} from '@/hooks/useOportunidades'
import { OportunidadeForm } from '@/components/oportunidades/OportunidadeForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const STATUS_VARIANT = { pending: 'secondary', published: 'default', rejected: 'destructive', closed: 'outline' }

function isExpired(op) {
  return op.expires_at < new Date().toISOString().slice(0, 10)
}

export default function OportunidadesAdmin() {
  const { data: oportunidades = [], isLoading } = useAllOportunidades()
  const createOp = useCreateOportunidade()
  const updateOp = useUpdateOportunidade()
  const deleteOp = useDeleteOportunidade()

  const [tab, setTab] = useState('pending')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const pendingCount = oportunidades.filter((o) => o.status === 'pending').length
  const rows = tab === 'all' ? oportunidades : oportunidades.filter((o) => o.status === tab)

  function openCreate() {
    setEditTarget(null)
    setDialogOpen(true)
  }

  function openEdit(op) {
    setEditTarget(op)
    setDialogOpen(true)
  }

  async function handleSubmit(fields) {
    try {
      if (editTarget) {
        await updateOp.mutateAsync({ id: editTarget.id, ...fields })
        toast.success('Vaga atualizada.')
      } else {
        await createOp.mutateAsync(fields)
        toast.success('Vaga criada.')
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao salvar vaga.')
    }
  }

  async function setStatus(op, status) {
    try {
      await updateOp.mutateAsync({ id: op.id, status })
      toast.success(status === 'published' ? 'Vaga publicada.' : 'Vaga rejeitada.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao atualizar vaga.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta vaga?')) return
    try {
      await deleteOp.mutateAsync(id)
      toast.success('Vaga excluída.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao excluir vaga.')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Oportunidades</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nova vaga
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="pending">
            Em análise{pendingCount > 0 && <Badge variant="secondary" className="ml-1.5">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="published">Publicadas</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vaga</TableHead>
              <TableHead className="hidden sm:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Enviada por</TableHead>
              <TableHead className="hidden md:table-cell">Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Nenhuma vaga nesta lista.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((op) => (
                <TableRow key={op.id}>
                  <TableCell>
                    <p className="font-medium">{op.title}</p>
                    <p className="text-xs text-muted-foreground">{companyLabel(op)}</p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{JOB_TYPE_LABELS[op.job_type]}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{op.poster?.full_name ?? '—'}</TableCell>
                  <TableCell className={`hidden md:table-cell ${isExpired(op) ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {new Date(`${op.expires_at}T00:00:00`).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[op.status]}>{STATUS_LABELS[op.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {op.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700" disabled={updateOp.isPending} onClick={() => setStatus(op, 'published')}>
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Aprovar</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={updateOp.isPending} onClick={() => setStatus(op, 'rejected')}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Rejeitar</span>
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(op)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={deleteOp.isPending} onClick={() => handleDelete(op.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <OportunidadeForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        loading={createOp.isPending || updateOp.isPending}
        initial={editTarget}
        isAdmin
      />
    </div>
  )
}
