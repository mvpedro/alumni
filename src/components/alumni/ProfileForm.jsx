import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagInput } from '@/components/common/TagInput'
import { useCompanies } from '@/hooks/useCompanies'

export function ProfileForm({ profile, onSubmit, loading }) {
  const { data: companies = [] } = useCompanies()

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações pessoais */}
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

      {/* Empresa e cargo */}
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

      {/* Localização */}
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

      {/* LinkedIn */}
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

      {/* Switches */}
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
    </form>
  )
}
