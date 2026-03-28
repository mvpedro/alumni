import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Combobox } from '@/components/common/Combobox'
import { useSectors } from '@/hooks/useSectors'
import { useCompanies } from '@/hooks/useCompanies'

function useCities() {
  return useQuery({
    queryKey: ['filter-cities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('alumni')
        .select('city')
        .not('city', 'is', null)
        .not('city', 'eq', '')
      const unique = [...new Set((data ?? []).map((d) => d.city).filter(Boolean))].sort()
      return unique
    },
  })
}

function useEntryClasses() {
  return useQuery({
    queryKey: ['filter-classes'],
    queryFn: async () => {
      const { data } = await supabase
        .from('alumni')
        .select('entry_class')
        .not('entry_class', 'is', null)
      const unique = [...new Set((data ?? []).map((d) => d.entry_class).filter(Boolean))].sort()
      return unique
    },
  })
}

export function AlumniFilters({ filters, onChange, isAdmin = false }) {
  const { data: sectors = [] } = useSectors()
  const { data: companies = [] } = useCompanies()
  const { data: cities = [] } = useCities()
  const { data: classes = [] } = useEntryClasses()

  function set(field, value) {
    onChange({ ...filters, [field]: value, page: 1 })
  }

  function clearAll() {
    onChange({
      search: filters.search,
      sector: '',
      company: '',
      city: '',
      entryClass: '',
      openToMentoring: false,
      isHiring: false,
      openToTrabalhoAlumni: false,
      openToTextInterview: false,
      openToAlumniTalk: false,
      openToSemanaAcademica: false,
      gender: '',
      isGraduando: false,
      page: 1,
    })
  }

  const hasActiveFilters =
    filters.sector ||
    filters.company ||
    filters.city ||
    filters.entryClass ||
    filters.openToMentoring ||
    filters.isHiring ||
    (isAdmin && (filters.openToTrabalhoAlumni || filters.openToTextInterview || filters.openToAlumniTalk || filters.openToSemanaAcademica || filters.gender || filters.isGraduando))

  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filtros</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
            Limpar
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Setor</Label>
        <Combobox
          options={sectors.map((s) => ({ value: s.id, label: s.name }))}
          value={filters.sector}
          onChange={(v) => set('sector', v)}
          placeholder="Todos os setores"
          searchPlaceholder="Buscar setor..."
          emptyMessage="Nenhum setor encontrado."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Empresa</Label>
        <Combobox
          options={companies.map((c) => ({ value: c.id, label: c.name }))}
          value={filters.company}
          onChange={(v) => set('company', v)}
          placeholder="Todas as empresas"
          searchPlaceholder="Buscar empresa..."
          emptyMessage="Nenhuma empresa encontrada."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Cidade</Label>
        <Combobox
          options={cities.map((c) => ({ value: c, label: c }))}
          value={filters.city}
          onChange={(v) => set('city', v)}
          placeholder="Todas as cidades"
          searchPlaceholder="Buscar cidade..."
          emptyMessage="Nenhuma cidade encontrada."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Turma de entrada</Label>
        <Combobox
          options={classes.map((c) => ({ value: c, label: c }))}
          value={filters.entryClass}
          onChange={(v) => set('entryClass', v)}
          placeholder="Todas as turmas"
          searchPlaceholder="Buscar turma..."
          emptyMessage="Nenhuma turma encontrada."
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="mentoring-filter"
          checked={filters.openToMentoring}
          onCheckedChange={(v) => set('openToMentoring', v)}
        />
        <Label htmlFor="mentoring-filter">Apenas mentores</Label>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="hiring-filter"
          checked={filters.isHiring}
          onCheckedChange={(v) => set('isHiring', v)}
        />
        <Label htmlFor="hiring-filter">Apenas contratando</Label>
      </div>

      {isAdmin && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</h3>

            <div className="flex items-center gap-3">
              <Switch
                id="trabalho-alumni-filter"
                checked={filters.openToTrabalhoAlumni}
                onCheckedChange={(v) => set('openToTrabalhoAlumni', v)}
              />
              <Label htmlFor="trabalho-alumni-filter">Disponível para Trabalho Alumni</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="text-interview-filter"
                checked={filters.openToTextInterview}
                onCheckedChange={(v) => set('openToTextInterview', v)}
              />
              <Label htmlFor="text-interview-filter">Disponível para Entrevista em texto</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="alumni-talk-filter"
                checked={filters.openToAlumniTalk}
                onCheckedChange={(v) => set('openToAlumniTalk', v)}
              />
              <Label htmlFor="alumni-talk-filter">Disponível para Alumni Talk</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="semana-academica-filter"
                checked={filters.openToSemanaAcademica}
                onCheckedChange={(v) => set('openToSemanaAcademica', v)}
              />
              <Label htmlFor="semana-academica-filter">Disponível para Semana Acadêmica</Label>
            </div>

            <div className="space-y-1.5">
              <Label>Gênero</Label>
              <Select value={filters.gender || ''} onValueChange={(v) => set('gender', v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="graduando-filter"
                checked={filters.isGraduando ?? false}
                onCheckedChange={(v) => set('isGraduando', v)}
              />
              <Label htmlFor="graduando-filter">Apenas graduandos</Label>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
