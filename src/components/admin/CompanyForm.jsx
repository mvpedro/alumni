import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSectors } from '@/hooks/useSectors'

const empty = {
  name: '',
  sector_id: '',
  website: '',
  logoFile: null,
}

export function CompanyForm({ open, onOpenChange, onSubmit, loading, initial }) {
  const { data: sectors = [] } = useSectors()
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name ?? '',
              sector_id: initial.sector_id ?? '',
              website: initial.website ?? '',
              logoFile: null,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar empresa' : 'Nova empresa'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="company-name">Nome</Label>
            <Input
              id="company-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-sector">Setor</Label>
            <Select
              value={form.sector_id || ''}
              onValueChange={(v) => set('sector_id', v === 'none' ? '' : v)}
            >
              <SelectTrigger id="company-sector" className="w-full">
                <SelectValue placeholder="Selecione um setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {sectors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-website">Website</Label>
            <Input
              id="company-website"
              type="url"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
              placeholder="https://exemplo.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-logo">Logo</Label>
            <Input
              id="company-logo"
              type="file"
              accept="image/*"
              onChange={(e) => set('logoFile', e.target.files?.[0] ?? null)}
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
