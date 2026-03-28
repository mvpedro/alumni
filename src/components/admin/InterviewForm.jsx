import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Bold, Italic, Heading2, List, Eye, EyeOff } from 'lucide-react'
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
import { Combobox } from '@/components/common/Combobox'
import { useAllAlumni } from '@/hooks/useAlumni'

const empty = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverFile: null,
  published: false,
  alumni_id: '',
}

function MarkdownToolbar({ textareaRef, onContentChange }) {
  function insertAtCursor(before, after = '') {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const text = el.value
    const selected = text.substring(start, end)
    const replacement = before + (selected || 'texto') + after
    const newText = text.substring(0, start) + replacement + text.substring(end)
    onContentChange(newText)
    // Restore cursor position after React re-renders
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = start + before.length
      el.selectionEnd = start + before.length + (selected || 'texto').length
    })
  }

  return (
    <div className="flex gap-1 rounded-t-md border border-b-0 bg-muted/50 px-2 py-1">
      <Button
        type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
        title="Negrito"
        onClick={() => insertAtCursor('**', '**')}
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
        title="Itálico"
        onClick={() => insertAtCursor('*', '*')}
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
        title="Pergunta (H2)"
        onClick={() => insertAtCursor('\n## ', '\n')}
      >
        <Heading2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
        title="Lista"
        onClick={() => insertAtCursor('\n- ', '\n')}
      >
        <List className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

export function InterviewForm({ open, onOpenChange, onSubmit, loading, initial }) {
  const [form, setForm] = useState(empty)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef(null)
  const { data: allAlumni = [] } = useAllAlumni()
  const alumniOptions = allAlumni.map((a) => ({ value: a.id, label: a.full_name }))

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
          alumni_id: initial.alumni_id ?? '',
        })
        setSlugManuallyEdited(true)
      } else {
        setForm(empty)
        setSlugManuallyEdited(false)
      }
      setShowPreview(false)
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar entrevista' : 'Nova entrevista'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
            <Label>Alumni entrevistado</Label>
            <Combobox
              options={alumniOptions}
              value={form.alumni_id}
              onChange={(val) => set('alumni_id', val)}
              placeholder="Selecionar alumni..."
              searchPlaceholder="Buscar alumni..."
              emptyMessage="Nenhum alumni encontrado."
            />
          </div>

          {/* Markdown editor with toolbar and preview toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Conteúdo (Markdown)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => setShowPreview((v) => !v)}
              >
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPreview ? 'Editar' : 'Preview'}
              </Button>
            </div>

            {showPreview ? (
              <div className="min-h-[300px] rounded-md border bg-white p-4 dark:bg-slate-900">
                <article className="prose prose-neutral max-w-none dark:prose-invert">
                  <ReactMarkdown>{form.content || '*Nenhum conteúdo ainda...*'}</ReactMarkdown>
                </article>
              </div>
            ) : (
              <div>
                <MarkdownToolbar
                  textareaRef={textareaRef}
                  onContentChange={(val) => set('content', val)}
                />
                <Textarea
                  ref={textareaRef}
                  value={form.content}
                  onChange={(e) => set('content', e.target.value)}
                  rows={18}
                  placeholder="Escreva o conteúdo em Markdown...&#10;&#10;Use ## para perguntas&#10;Texto normal para respostas"
                  className="rounded-t-none font-mono text-sm"
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Dica: use <code className="rounded bg-muted px-1">## Pergunta</code> para perguntas e texto normal para respostas.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="interview-cover">Imagem de capa</Label>
              <Input
                id="interview-cover"
                type="file"
                accept="image/*"
                onChange={(e) => set('coverFile', e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex items-center gap-2 sm:pt-7">
              <Switch
                id="interview-published"
                checked={form.published}
                onCheckedChange={(checked) => set('published', checked)}
              />
              <Label htmlFor="interview-published">Publicado</Label>
            </div>
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
