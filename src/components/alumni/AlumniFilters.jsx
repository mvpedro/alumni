import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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

export function AlumniFilters({ filters, onChange }) {
  const { data: sectors = [] } = useSectors()
  const { data: companies = [] } = useCompanies()
  const { data: cities = [] } = useCities()
  const { data: classes = [] } = useEntryClasses()

  function set(field, value) {
    onChange({ ...filters, [field]: value, page: 1 })
  }

  function clearAll() {
    onChange({ search: filters.search, sector: '', company: '', city: '', entryClass: '', openToMentoring: false, page: 1 })
  }

  const hasActiveFilters = filters.sector || filters.company || filters.city || filters.entryClass || filters.openToMentoring

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
    </aside>
  )
}
