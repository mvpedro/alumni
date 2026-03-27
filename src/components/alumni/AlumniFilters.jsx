import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
        <Select value={filters.sector || 'all'} onValueChange={(v) => set('sector', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos os setores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os setores</SelectItem>
            {sectors.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Empresa</Label>
        <Select value={filters.company || 'all'} onValueChange={(v) => set('company', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas as empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
