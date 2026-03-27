import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  useTrabalhoAlumni,
  useCreateVideo,
  useUpdateVideo,
  useDeleteVideo,
} from '@/hooks/useTrabalhoAlumni'
import { TrabalhoAlumniForm } from '@/components/admin/TrabalhoAlumniForm'
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

export default function TrabalhoAlumniAdmin() {
  const { data: videos = [], isLoading } = useTrabalhoAlumni()
  const createVideo = useCreateVideo()
  const updateVideo = useUpdateVideo()
  const deleteVideo = useDeleteVideo()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  function openCreate() {
    setEditTarget(null)
    setDialogOpen(true)
  }

  function openEdit(video) {
    setEditTarget(video)
    setDialogOpen(true)
  }

  async function handleSubmit(fields) {
    try {
      if (editTarget) {
        await updateVideo.mutateAsync({ id: editTarget.id, ...fields })
        toast.success('Vídeo atualizado.')
      } else {
        await createVideo.mutateAsync(fields)
        toast.success('Vídeo criado.')
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao salvar vídeo.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este vídeo?')) return
    try {
      await deleteVideo.mutateAsync(id)
      toast.success('Vídeo excluído.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao excluir vídeo.')
    }
  }

  const isSaving = createVideo.isPending || updateVideo.isPending

  function truncate(str, max = 50) {
    if (!str) return '—'
    return str.length > max ? str.slice(0, max) + '…' : str
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trabalho Alumni</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Novo vídeo
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">YouTube URL</TableHead>
              <TableHead className="w-16 text-center">Ordem</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-8" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
                </TableRow>
              ))
            ) : videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Nenhum vídeo cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title || '—'}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {truncate(video.youtube_url)}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {video.display_order ?? 0}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {video.published ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Rascunho</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(video)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={deleteVideo.isPending}
                        onClick={() => handleDelete(video.id)}
                      >
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

      <TrabalhoAlumniForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        loading={isSaving}
        initial={editTarget}
      />
    </div>
  )
}
