import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Briefcase, Plus, RotateCcw, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import {
  useOportunidades,
  useMyOportunidades,
  useCreateOportunidade,
  useUpdateOportunidade,
  AREA_LABELS,
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  STATUS_LABELS,
  companyLabel,
} from '@/hooks/useOportunidades'
import { OportunidadeCard } from '@/components/oportunidades/OportunidadeCard'
import { OportunidadeDetail } from '@/components/oportunidades/OportunidadeDetail'
import { OportunidadeForm } from '@/components/oportunidades/OportunidadeForm'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchBar } from '@/components/common/SearchBar'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ALL = 'all'
const defaultFilters = { search: '', area: ALL, jobType: ALL, workMode: ALL }

function normalize(text) {
  return (text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function FilterSelect({ value, onChange, labels, placeholder }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-44">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {Object.entries(labels).map(([v, label]) => (
          <SelectItem key={v} value={v}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const STATUS_VARIANT = { pending: 'secondary', published: 'default', rejected: 'destructive', closed: 'outline' }

function MinhasVagas({ items, onEdit, onClose }) {
  if (items.length === 0) return null
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold">Minhas vagas</h2>
      <div className="divide-y rounded-xl border">
        {items.map((op) => (
          <div key={op.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{op.title}</p>
              <p className="truncate text-sm text-muted-foreground">{companyLabel(op)}</p>
            </div>
            <Badge variant={STATUS_VARIANT[op.status]}>{STATUS_LABELS[op.status]}</Badge>
            {op.status !== 'closed' && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(op)}>Editar</Button>
                <Button variant="ghost" size="sm" onClick={() => onClose(op)}>Encerrar</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Oportunidades() {
  const { user, isAuthenticated, isApproved, isAdmin } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(defaultFilters)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const { data: oportunidades = [], isLoading } = useOportunidades()
  const { data: mine = [] } = useMyOportunidades(user?.id)
  const createOp = useCreateOportunidade()
  const updateOp = useUpdateOportunidade()

  const selectedId = searchParams.get('vaga')
  const selected = oportunidades.find((o) => o.id === selectedId) ?? mine.find((o) => o.id === selectedId)

  const filtered = useMemo(() => {
    const q = normalize(filters.search)
    return oportunidades.filter((op) =>
      (filters.area === ALL || op.area === filters.area) &&
      (filters.jobType === ALL || op.job_type === filters.jobType) &&
      (filters.workMode === ALL || op.work_mode === filters.workMode) &&
      (!q || normalize(`${op.title} ${companyLabel(op)} ${op.location}`).includes(q))
    )
  }, [oportunidades, filters])

  const hasFilters = filters.search || filters.area !== ALL || filters.jobType !== ALL || filters.workMode !== ALL

  function set(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  function openDetail(op) {
    setSearchParams({ vaga: op.id }, { replace: false })
  }

  function closeDetail() {
    setSearchParams({}, { replace: false })
  }

  function openCreate() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(op) {
    setEditTarget(op)
    setFormOpen(true)
  }

  async function handleSubmit(fields) {
    try {
      if (editTarget) {
        await updateOp.mutateAsync({ id: editTarget.id, ...fields })
        toast.success(isAdmin ? 'Vaga atualizada.' : 'Vaga atualizada e enviada para revisão.')
      } else {
        await createOp.mutateAsync(fields)
        toast.success(isAdmin ? 'Vaga publicada.' : 'Vaga enviada! Ela aparecerá aqui após aprovação.')
      }
      setFormOpen(false)
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao salvar vaga.')
    }
  }

  async function handleClose(op) {
    if (!confirm('Encerrar esta vaga? Ela deixará de aparecer na lista.')) return
    try {
      await updateOp.mutateAsync({ id: op.id, status: 'closed' })
      toast.success('Vaga encerrada.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao encerrar vaga.')
    }
  }

  let action = null
  if (isApproved) {
    action = (
      <Button onClick={openCreate}>
        <Plus className="mr-1.5 h-4 w-4" />
        Divulgar vaga
      </Button>
    )
  } else if (!isAuthenticated) {
    action = (
      <Button variant="outline" asChild>
        <Link to="/login">Entre para divulgar uma vaga</Link>
      </Button>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <PageHeader
        title="Oportunidades"
        description="Vagas de emprego e estágio divulgadas pela comunidade Alumni Automação UFSC."
      >
        {action && <div className="mt-4">{action}</div>}
      </PageHeader>

      <div className="mb-6 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex-1 sm:min-w-56">
          <SearchBar value={filters.search} onChange={(v) => set('search', v)} placeholder="Buscar por vaga, empresa ou local" />
        </div>
        <FilterSelect value={filters.area} onChange={(v) => set('area', v)} labels={AREA_LABELS} placeholder="Todas as áreas" />
        <FilterSelect value={filters.jobType} onChange={(v) => set('jobType', v)} labels={JOB_TYPE_LABELS} placeholder="Todos os tipos" />
        <FilterSelect value={filters.workMode} onChange={(v) => set('workMode', v)} labels={WORK_MODE_LABELS} placeholder="Todas as modalidades" />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(defaultFilters)} className="text-muted-foreground">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : oportunidades.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Nenhuma vaga aberta no momento"
          description="Conhece uma oportunidade para a comunidade? Divulgue aqui."
          action={action}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhuma vaga encontrada"
          description="Tente ajustar a busca ou os filtros."
          action={<Button variant="outline" onClick={() => setFilters(defaultFilters)}>Limpar filtros</Button>}
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'oportunidade encontrada' : 'oportunidades encontradas'}
          </p>
          <div className="space-y-3">
            {filtered.map((op) => (
              <OportunidadeCard key={op.id} op={op} onClick={() => openDetail(op)} />
            ))}
          </div>
        </>
      )}

      <MinhasVagas items={mine} onEdit={openEdit} onClose={handleClose} />

      <OportunidadeDetail op={selected} open={!!selected} onOpenChange={(o) => !o && closeDetail()} />

      <OportunidadeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        loading={createOp.isPending || updateOp.isPending}
        initial={editTarget}
        isAdmin={isAdmin}
      />
    </div>
  )
}
