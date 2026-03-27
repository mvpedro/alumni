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
import { slugify } from '@/hooks/useInterviews'

const empty = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverFile: null,
  published: false,
}

export function InterviewForm({ open, onOpenChange, onSubmit, loading, initial }) {
  const [form, setForm] = useState(empty)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          title: initial.title ?? '',
          slug: initial.slug ?? '',
          excerpt: initial.excerpt ?? '',
          content: initial.content ?? '',
          coverFile: null,
          published: initial.published ?? false,
        })
        setSlugManuallyEdited(true) // on edit, don't auto-regenerate slug
      } else {
        setForm(empty)
        setSlugManuallyEdited(false)
      }
    }
  }, [open, initial])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleTitleChange(e) {
    const title = e.target.value
    set('title', title)
    if (!slugManuallyEdited) {
      set('slug', slugify(title))
    }
  }

  function handleSlugChange(e) {
    setSlugManuallyEdited(true)
    set('slug', e.target.value)
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar entrevista' : 'Nova entrevista'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="interview-title">Título</Label>
            <Input
              id="interview-title"
              value={form.title}
              onChange={handleTitleChange}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interview-slug">Slug</Label>
            <Input
              id="interview-slug"
              value={form.slug}
              onChange={handleSlugChange}
              placeholder="url-amigavel-do-post"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interview-excerpt">Resumo</Label>
            <Textarea
              id="interview-excerpt"
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              rows={2}
              placeholder="Breve descrição da entrevista..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interview-content">Conteúdo (Markdown)</Label>
            <Textarea
              id="interview-content"
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              rows={15}
              placeholder="Escreva o conteúdo em Markdown..."
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interview-cover">Imagem de capa</Label>
            <Input
              id="interview-cover"
              type="file"
              accept="image/*"
              onChange={(e) => set('coverFile', e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="interview-published"
              checked={form.published}
              onCheckedChange={(checked) => set('published', checked)}
            />
            <Label htmlFor="interview-published">Publicado</Label>
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
