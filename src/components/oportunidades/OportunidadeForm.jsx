import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Combobox } from '@/components/common/Combobox'
import { useCompanies } from '@/hooks/useCompanies'
import { AREA_LABELS, JOB_TYPE_LABELS, WORK_MODE_LABELS, STATUS_LABELS } from '@/hooks/useOportunidades'

function defaultExpiry() {
  const d = new Date()
  d.setDate(d.getDate() + 60)
  return d.toISOString().slice(0, 10)
}

const empty = () => ({
  title: '',
  company_id: '',
  company_name: '',
  area: 'engenharia',
  job_type: 'clt',
  work_mode: 'presencial',
  location: '',
  salary_min: '',
  salary_max: '',
  description: '',
  activities: '',
  requirements: '',
  apply_url: '',
  apply_email: '',
  expires_at: defaultExpiry(),
  status: 'published',
})

function EnumSelect({ id, labels, value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(labels).map(([v, label]) => (
          <SelectItem key={v} value={v}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function OportunidadeForm({ open, onOpenChange, onSubmit, loading, initial, isAdmin = false }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState(null)
  const { data: companies = [] } = useCompanies()

  useEffect(() => {
    if (!open) return
    setError(null)
    if (!initial) {
      setForm(empty())
      return
    }
    const base = empty()
    setForm(Object.fromEntries(Object.keys(base).map((k) => [k, initial[k] ?? base[k]])))
  }, [open, initial])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.company_id && !form.company_name.trim()) {
      setError('Selecione uma empresa da lista ou informe o nome da empresa.')
      return
    }
    if (!form.apply_url.trim() && !form.apply_email.trim()) {
      setError('Informe um link ou um e-mail para candidatura.')
      return
    }
    if (form.salary_min && form.salary_max && Number(form.salary_min) > Number(form.salary_max)) {
      setError('O salário mínimo não pode ser maior que o máximo.')
      return
    }
    const nullable = (v) => (typeof v === 'string' ? v.trim() || null : v)
    const { status, ...rest } = form
    onSubmit({
      ...rest,
      title: form.title.trim(),
      company_id: form.company_id || null,
      company_name: nullable(form.company_name),
      location: nullable(form.location),
      salary_min: form.salary_min === '' ? null : Number(form.salary_min),
      salary_max: form.salary_max === '' ? null : Number(form.salary_max),
      activities: nullable(form.activities),
      requirements: nullable(form.requirements),
      apply_url: nullable(form.apply_url),
      apply_email: nullable(form.apply_email),
      ...(isAdmin ? { status } : {}),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar vaga' : 'Divulgar vaga'}</DialogTitle>
          {!isAdmin && (
            <DialogDescription>
              A vaga será revisada pela equipe Alumni antes de ser publicada.
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="space-y-1.5">
            <Label htmlFor="op-title">Título da vaga *</Label>
            <Input id="op-title" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="ex: Engenheiro(a) de Controle e Automação" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Empresa</Label>
              <Combobox
                options={companies.map((c) => ({ value: c.id, label: c.name }))}
                value={form.company_id}
                onChange={(v) => set('company_id', v)}
                placeholder="Selecionar empresa..."
                searchPlaceholder="Buscar empresa..."
                emptyMessage="Não encontrou? Use o campo ao lado."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="op-company-name">Ou nome da empresa</Label>
              <Input id="op-company-name" value={form.company_name} onChange={(e) => set('company_name', e.target.value)} disabled={!!form.company_id} placeholder="Se não estiver na lista" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="op-area">Área *</Label>
              <EnumSelect id="op-area" labels={AREA_LABELS} value={form.area} onChange={(v) => set('area', v)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="op-type">Tipo *</Label>
              <EnumSelect id="op-type" labels={JOB_TYPE_LABELS} value={form.job_type} onChange={(v) => set('job_type', v)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="op-mode">Modalidade *</Label>
              <EnumSelect id="op-mode" labels={WORK_MODE_LABELS} value={form.work_mode} onChange={(v) => set('work_mode', v)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="op-location">Local</Label>
              <Input id="op-location" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Florianópolis — SC" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="op-salary-min">Salário mín. (R$)</Label>
              <Input id="op-salary-min" type="number" min="0" step="100" value={form.salary_min} onChange={(e) => set('salary_min', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="op-salary-max">Salário máx. (R$)</Label>
              <Input id="op-salary-max" type="number" min="0" step="100" value={form.salary_max} onChange={(e) => set('salary_max', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="op-description">Sobre a vaga *</Label>
            <Textarea id="op-description" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="op-activities">Principais atividades</Label>
            <Textarea id="op-activities" rows={4} value={form.activities} onChange={(e) => set('activities', e.target.value)} placeholder={'- Uma atividade por linha\n- Aceita markdown'} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="op-requirements">Requisitos</Label>
            <Textarea id="op-requirements" rows={4} value={form.requirements} onChange={(e) => set('requirements', e.target.value)} placeholder={'- Um requisito por linha\n- Aceita markdown'} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="op-apply-url">Link para candidatura</Label>
              <Input id="op-apply-url" type="url" value={form.apply_url} onChange={(e) => set('apply_url', e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="op-apply-email">E-mail para currículos</Label>
              <Input id="op-apply-email" type="email" value={form.apply_email} onChange={(e) => set('apply_email', e.target.value)} placeholder="talentos@empresa.com" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="op-expires">Válida até *</Label>
              <Input id="op-expires" type="date" value={form.expires_at} onChange={(e) => set('expires_at', e.target.value)} required />
            </div>
            {isAdmin && (
              <div className="space-y-1.5">
                <Label htmlFor="op-status">Status</Label>
                <EnumSelect id="op-status" labels={STATUS_LABELS} value={form.status} onChange={(v) => set('status', v)} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : isAdmin ? 'Salvar' : 'Enviar para revisão'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
