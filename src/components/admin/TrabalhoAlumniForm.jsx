import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const empty = {
  title: '',
  description: '',
  youtube_url: '',
  thumbnail_url: '',
  display_order: 0,
  published: false,
}

export function TrabalhoAlumniForm({ open, onOpenChange, onSubmit, loading, initial }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              title: initial.title ?? '',
              description: initial.description ?? '',
              youtube_url: initial.youtube_url ?? '',
              thumbnail_url: initial.thumbnail_url ?? '',
              display_order: initial.display_order ?? 0,
              published: initial.published ?? false,
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
    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar vídeo' : 'Novo vídeo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="video-title">Título</Label>
            <Input
              id="video-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="video-description">Descrição</Label>
            <Textarea
              id="video-description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Breve descrição do vídeo..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="video-url">URL do YouTube *</Label>
            <Input
              id="video-url"
              value={form.youtube_url}
              onChange={(e) => set('youtube_url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="video-order">Ordem de exibição</Label>
            <Input
              id="video-order"
              type="number"
              value={form.display_order}
              onChange={(e) => set('display_order', Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="video-published"
              checked={form.published}
              onCheckedChange={(checked) => set('published', checked)}
            />
            <Label htmlFor="video-published">Publicado</Label>
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
