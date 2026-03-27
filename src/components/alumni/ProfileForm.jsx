import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TagInput } from '@/components/common/TagInput'
import { useCompanies, useSuggestCompany } from '@/hooks/useCompanies'
import { useSectors } from '@/hooks/useSectors'

function SectionHeading({ children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {children}
      </h3>
      <Separator className="mt-2" />
    </div>
  )
}

function SuggestCompanyDialog({ open, onOpenChange }) {
  const { data: sectors = [] } = useSectors()
  const suggestCompany = useSuggestCompany()
  const [form, setForm] = useState({ name: '', sector_id: '', website: '', logoFile: null })

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await suggestCompany.mutateAsync(form)
      toast.success('Empresa sugerida! Um administrador irá revisar.')
      onOpenChange(false)
      setForm({ name: '', sector_id: '', website: '', logoFile: null })
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao sugerir empresa.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sugerir nova empresa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="suggest-name">Nome da empresa *</Label>
            <Input
              id="suggest-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="suggest-sector">Setor</Label>
            <Select
              value={form.sector_id || ''}
              onValueChange={(v) => set('sector_id', v === 'none' ? '' : v)}
            >
              <SelectTrigger id="suggest-sector" className="w-full">
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
            <Label htmlFor="suggest-website">Website</Label>
            <Input
              id="suggest-website"
              type="url"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
              placeholder="https://exemplo.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="suggest-logo">Logo</Label>
            <Input
              id="suggest-logo"
              type="file"
              accept="image/*"
              onChange={(e) => set('logoFile', e.target.files?.[0] ?? null)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={suggestCompany.isPending}>
              {suggestCompany.isPending ? 'Enviando...' : 'Sugerir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProfileForm({ profile, onSubmit, loading }) {
  const { data: allCompanies = [] } = useCompanies()
  const companies = allCompanies.filter((c) => !c.status || c.status === 'approved')
  const [suggestOpen, setSuggestOpen] = useState(false)

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    entry_class: profile?.entry_class ?? '',
    graduation_class: profile?.graduation_class ?? '',
    company_id: profile?.company_id ?? '',
    job_title: profile?.job_title ?? '',
    city: profile?.city ?? '',
    state: profile?.state ?? '',
    country: profile?.country ?? '',
    linkedin_url: profile?.linkedin_url ?? '',
    contact_email: profile?.contact_email ?? '',
    bio: profile?.bio ?? '',
    skills: profile?.skills ?? [],
    interests: profile?.interests ?? [],
    open_to_mentoring: profile?.open_to_mentoring ?? false,
    open_to_contact: profile?.open_to_contact ?? false,
  })

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* --- Informações pessoais --- */}
      <SectionHeading>Informações pessoais</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input
            id="full_name"
            value={form.full_name}
            onChange={(e) => set('full_name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_email">E-mail de contato</Label>
          <Input
            id="contact_email"
            type="email"
            value={form.contact_email}
            onChange={(e) => set('contact_email', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="entry_class">Turma de entrada</Label>
          <Input
            id="entry_class"
            value={form.entry_class}
            onChange={(e) => set('entry_class', e.target.value)}
            placeholder="ex: 2018"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="graduation_class">Turma de formatura</Label>
          <Input
            id="graduation_class"
            value={form.graduation_class}
            onChange={(e) => set('graduation_class', e.target.value)}
            placeholder="ex: 2022"
          />
        </div>
      </div>

      {/* --- Profissional --- */}
      <SectionHeading>Profissional</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="company_id">Empresa</Label>
          <Select
            value={form.company_id || ''}
            onValueChange={(v) => set('company_id', v === 'none' ? null : v)}
          >
            <SelectTrigger id="company_id" className="w-full">
              <SelectValue placeholder="Selecione uma empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            className="mt-1 text-xs text-primary hover:underline"
            onClick={() => setSuggestOpen(true)}
          >
            Empresa não encontrada? Sugerir nova
          </button>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="job_title">Cargo</Label>
          <Input
            id="job_title"
            value={form.job_title}
            onChange={(e) => set('job_title', e.target.value)}
            placeholder="ex: Engenheiro de Software"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={form.bio}
          onChange={(e) => set('bio', e.target.value)}
          placeholder="Conte um pouco sobre você..."
          rows={4}
        />
      </div>

      {/* Skills e interesses */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Habilidades</Label>
          <TagInput
            value={form.skills}
            onChange={(v) => set('skills', v)}
            placeholder="Adicione habilidades (Enter)"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Interesses</Label>
          <TagInput
            value={form.interests}
            onChange={(v) => set('interests', v)}
            placeholder="Adicione interesses (Enter)"
          />
        </div>
      </div>

      {/* --- Contato --- */}
      <SectionHeading>Contato</SectionHeading>
      <div className="space-y-1.5">
        <Label htmlFor="linkedin_url">LinkedIn</Label>
        <Input
          id="linkedin_url"
          type="url"
          value={form.linkedin_url}
          onChange={(e) => set('linkedin_url', e.target.value)}
          placeholder="https://linkedin.com/in/seu-perfil"
        />
      </div>

      {/* --- Localização --- */}
      <SectionHeading>Localização</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={form.state}
            onChange={(e) => set('state', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">País</Label>
          <Input
            id="country"
            value={form.country}
            onChange={(e) => set('country', e.target.value)}
          />
        </div>
      </div>

      {/* --- Preferências --- */}
      <SectionHeading>Preferências</SectionHeading>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <Switch
            id="open_to_mentoring"
            checked={form.open_to_mentoring}
            onCheckedChange={(v) => set('open_to_mentoring', v)}
          />
          <Label htmlFor="open_to_mentoring">Disponível para mentoria</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="open_to_contact"
            checked={form.open_to_contact}
            onCheckedChange={(v) => set('open_to_contact', v)}
          />
          <Label htmlFor="open_to_contact">Disponível para contato</Label>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? 'Salvando...' : 'Salvar perfil'}
      </Button>

      <SuggestCompanyDialog open={suggestOpen} onOpenChange={setSuggestOpen} />
    </form>
  )
}
