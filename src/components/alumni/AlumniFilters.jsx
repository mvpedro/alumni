import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Combobox } from '@/components/common/Combobox'
import { useSectors } from '@/hooks/useSectors'
import { useCompanies } from '@/hooks/useCompanies'

export function AlumniFilters({ filters, onChange }) {
  const { data: sectors = [] } = useSectors()
  const { data: companies = [] } = useCompanies()

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
        <Label htmlFor="city-filter">Cidade</Label>
        <Input
          id="city-filter"
          placeholder="ex: Florianópolis"
          value={filters.city}
          onChange={(e) => set('city', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="class-filter">Turma de entrada</Label>
        <Input
          id="class-filter"
          placeholder="ex: 2018"
          value={filters.entryClass}
          onChange={(e) => set('entryClass', e.target.value)}
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
