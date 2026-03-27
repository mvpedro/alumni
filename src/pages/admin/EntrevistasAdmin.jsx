import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useInterviews,
  useCreateInterview,
  useUpdateInterview,
  useDeleteInterview,
} from '@/hooks/useInterviews'
import { InterviewForm } from '@/components/admin/InterviewForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export default function EntrevistasAdmin() {
  const { data: interviews = [], isLoading } = useInterviews()
  const createInterview = useCreateInterview()
  const updateInterview = useUpdateInterview()
  const deleteInterview = useDeleteInterview()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  function openCreate() {
    setEditTarget(null)
    setDialogOpen(true)
  }

  function openEdit(interview) {
    setEditTarget(interview)
    setDialogOpen(true)
  }

  async function handleSubmit({ coverFile, ...fields }) {
    try {
      if (editTarget) {
        await updateInterview.mutateAsync({ id: editTarget.id, coverFile, ...fields })
        toast.success('Entrevista atualizada.')
      } else {
        await createInterview.mutateAsync({ coverFile, ...fields })
        toast.success('Entrevista criada.')
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao salvar entrevista.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta entrevista?')) return
    try {
      await deleteInterview.mutateAsync(id)
      toast.success('Entrevista excluída.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao excluir entrevista.')
    }
  }

  const isSaving = createInterview.isPending || updateInterview.isPending

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Entrevistas</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Novo post
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Publicado em</TableHead>
              <TableHead className="w-20 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : interviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Nenhuma entrevista encontrada.
                </TableCell>
              </TableRow>
            ) : (
              interviews.map((interview) => (
                <TableRow
                  key={interview.id}
                  className="cursor-pointer"
                  onClick={() => openEdit(interview)}
                >
                  <TableCell className="font-medium">{interview.title}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {interview.published ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Rascunho</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDate(interview.published_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={deleteInterview.isPending}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(interview.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InterviewForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        loading={isSaving}
        initial={editTarget}
      />
    </div>
  )
}
