import { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAllPalestras,
  useCreatePalestra,
  useUpdatePalestra,
  useDeletePalestra,
} from '@/hooks/usePalestras'
import { useAllAlumni } from '@/hooks/useAlumni'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Combobox } from '@/components/common/Combobox'
import { Skeleton } from '@/components/ui/skeleton'

const CATEGORY_LABELS = {
  alumni_talk: 'Alumni Talk',
  evento: 'Evento',
}

const empty = {
  title: '',
  description: '',
  youtube_url: '',
  category: 'alumni_talk',
  alumni_id: '',
  event_name: '',
  event_date: '',
  display_order: 0,
  published: true,
}

function PalestraForm({ open, onOpenChange, onSubmit, loading, initial }) {
  const [form, setForm] = useState(empty)
  const { data: allAlumni = [] } = useAllAlumni()
  const alumniOptions = allAlumni.map((a) => ({ value: a.id, label: a.full_name }))

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              title: initial.title ?? '',
              description: initial.description ?? '',
              youtube_url: initial.youtube_url ?? '',
              category: initial.category ?? 'alumni_talk',
              alumni_id: initial.alumni_id ?? '',
              event_name: initial.event_name ?? '',
              event_date: initial.event_date ?? '',
              display_order: initial.display_order ?? 0,
              published: initial.published ?? true,
            }
          : empty
      )
    }
  }, [open, initial])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      alumni_id: form.alumni_id || null,
      event_name: form.event_name || null,
      event_date: form.event_date || null,
    }
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar palestra' : 'Nova palestra'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="palestra-title">Título *</Label>
            <Input
              id="palestra-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="palestra-description">Descrição</Label>
            <Textarea
              id="palestra-description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Breve descrição da palestra..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="palestra-url">URL do YouTube *</Label>
            <Input
              id="palestra-url"
              value={form.youtube_url}
              onChange={(e) => set('youtube_url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="palestra-category">Categoria *</Label>
            <Select value={form.category} onValueChange={(v) => set('category', v)}>
              <SelectTrigger id="palestra-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alumni_talk">Alumni Talk</SelectItem>
                <SelectItem value="evento">Evento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Alumni relacionado</Label>
            <Combobox
              options={alumniOptions}
              value={form.alumni_id}
              onChange={(val) => set('alumni_id', val)}
              placeholder="Selecionar alumni..."
              searchPlaceholder="Buscar alumni..."
              emptyMessage="Nenhum alumni encontrado."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="palestra-event-name">Nome do evento</Label>
              <Input
                id="palestra-event-name"
                value={form.event_name}
                onChange={(e) => set('event_name', e.target.value)}
                placeholder="ex: DAS-UFSC"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="palestra-event-date">Data do evento</Label>
              <Input
                id="palestra-event-date"
                type="date"
                value={form.event_date}
                onChange={(e) => set('event_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="palestra-order">Ordem de exibição</Label>
            <Input
              id="palestra-order"
              type="number"
              value={form.display_order}
              onChange={(e) => set('display_order', Number(e.target.value))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function truncate(str, max = 50) {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '…' : str
}

export default function PalestrasAdmin() {
  const { data: palestras = [], isLoading } = useAllPalestras()
  const createPalestra = useCreatePalestra()
  const updatePalestra = useUpdatePalestra()
  const deletePalestra = useDeletePalestra()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  function openCreate() {
    setEditTarget(null)
    setDialogOpen(true)
  }

  function openEdit(palestra) {
    setEditTarget(palestra)
    setDialogOpen(true)
  }

  async function handleSubmit(fields) {
    try {
      if (editTarget) {
        await updatePalestra.mutateAsync({ id: editTarget.id, ...fields })
        toast.success('Palestra atualizada.')
      } else {
        await createPalestra.mutateAsync(fields)
        toast.success('Palestra criada.')
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao salvar palestra.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta palestra?')) return
    try {
      await deletePalestra.mutateAsync(id)
      toast.success('Palestra excluída.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao excluir palestra.')
    }
  }

  const isSaving = createPalestra.isPending || updatePalestra.isPending

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Palestras</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nova palestra
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden sm:table-cell">Categoria</TableHead>
              <TableHead className="hidden md:table-cell">Alumni</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
                </TableRow>
              ))
            ) : palestras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Nenhuma palestra cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              palestras.map((palestra) => (
                <TableRow key={palestra.id}>
                  <TableCell className="font-medium">{truncate(palestra.title, 60)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={palestra.category === 'alumni_talk' ? 'default' : 'secondary'}>
                      {CATEGORY_LABELS[palestra.category] ?? palestra.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {palestra.alumni?.full_name ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(palestra)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={deletePalestra.isPending}
                        onClick={() => handleDelete(palestra.id)}
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

      <PalestraForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        loading={isSaving}
        initial={editTarget}
      />
    </div>
  )
}
