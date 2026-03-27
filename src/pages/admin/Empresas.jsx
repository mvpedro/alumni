import { useState } from 'react'
import { Trash2, Plus, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  usePendingCompanies,
  useApproveCompany,
} from '@/hooks/useCompanies'
import { useSectors } from '@/hooks/useSectors'
import { CompanyForm } from '@/components/admin/CompanyForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ─── Approved tab (Tasks 4 + 5) ─────────────────────────────────────────────

function ApprovedTab() {
  const { data: companies = [], isLoading } = useCompanies()
  const { data: sectors = [] } = useSectors()
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()
  const deleteCompany = useDeleteCompany()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [showUnclassified, setShowUnclassified] = useState(false)

  const approved = companies.filter((c) => !c.status || c.status === 'approved')

  const unclassifiedCount = approved.filter(
    (c) => !c.sector || c.sector.name === 'Não classificado'
  ).length

  const filtered = approved.filter((c) => {
    const matchSearch =
      search === '' || c.name.toLowerCase().includes(search.toLowerCase())
    const matchUnclassified =
      !showUnclassified || !c.sector || c.sector.name === 'Não classificado'
    return matchSearch && matchUnclassified
  })

  function openCreate() {
    setEditTarget(null)
    setDialogOpen(true)
  }

  function openEdit(company) {
    setEditTarget(company)
    setDialogOpen(true)
  }

  async function handleSubmit({ logoFile, ...fields }) {
    try {
      if (editTarget) {
        await updateCompany.mutateAsync({ id: editTarget.id, logoFile, ...fields })
        toast.success('Empresa atualizada.')
      } else {
        await createCompany.mutateAsync({ logoFile, ...fields })
        toast.success('Empresa criada.')
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao salvar empresa.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta empresa?')) return
    try {
      await deleteCompany.mutateAsync(id)
      toast.success('Empresa excluída.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao excluir empresa.')
    }
  }

  async function handleSectorChange(companyId, sectorId) {
    try {
      await updateCompany.mutateAsync({
        id: companyId,
        sector_id: sectorId === 'none' ? null : sectorId,
      })
      toast.success('Setor atualizado.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao atualizar setor.')
    }
  }

  const isSaving = createCompany.isPending || updateCompany.isPending

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Button
          variant={showUnclassified ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowUnclassified((v) => !v)}
        >
          Mostrar apenas sem setor
        </Button>
        {unclassifiedCount > 0 && (
          <Badge variant="secondary">{unclassifiedCount} empresas sem setor</Badge>
        )}
        <div className="ml-auto">
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nova empresa
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Logo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Setor</TableHead>
              <TableHead className="w-20 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((company) => (
                <TableRow
                  key={company.id}
                  className="cursor-pointer"
                  onClick={() => openEdit(company)}
                >
                  <TableCell>
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="h-8 w-8 rounded object-contain"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-bold text-muted-foreground">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell
                    className="hidden sm:table-cell"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Select
                      value={company.sector_id ?? 'none'}
                      onValueChange={(v) => handleSectorChange(company.id, v)}
                    >
                      <SelectTrigger className="h-7 w-44 text-xs">
                        <SelectValue placeholder="Selecionar setor" />
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
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={deleteCompany.isPending}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(company.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CompanyForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        loading={isSaving}
        initial={editTarget}
      />
    </div>
  )
}

// ─── Pending tab (Task 4) ────────────────────────────────────────────────────

function PendingTab() {
  const { data: pending = [], isLoading } = usePendingCompanies()
  const approveCompany = useApproveCompany()
  const deleteCompany = useDeleteCompany()

  async function handleApprove(id) {
    try {
      await approveCompany.mutateAsync(id)
      toast.success('Empresa aprovada.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao aprovar empresa.')
    }
  }

  async function handleReject(id) {
    if (!confirm('Rejeitar e excluir esta empresa?')) return
    try {
      await deleteCompany.mutateAsync(id)
      toast.success('Empresa rejeitada.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao rejeitar empresa.')
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden sm:table-cell">Setor</TableHead>
            <TableHead className="hidden md:table-cell">Website</TableHead>
            <TableHead className="w-24 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Carregando...
              </TableCell>
            </TableRow>
          ) : pending.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Nenhuma empresa pendente.
              </TableCell>
            </TableRow>
          ) : (
            pending.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {company.sector?.name ?? '—'}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {company.website}
                    </a>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700"
                      disabled={approveCompany.isPending}
                      onClick={() => handleApprove(company.id)}
                      title="Aprovar"
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Aprovar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={deleteCompany.isPending}
                      onClick={() => handleReject(company.id)}
                      title="Rejeitar"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Rejeitar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Empresas() {
  const { data: pending = [] } = usePendingCompanies()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Empresas</h1>
      </div>

      <Tabs defaultValue="aprovadas">
        <TabsList className="mb-4">
          <TabsTrigger value="aprovadas">Aprovadas</TabsTrigger>
          <TabsTrigger value="pendentes">
            Pendentes {pending.length > 0 && `(${pending.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aprovadas">
          <ApprovedTab />
        </TabsContent>

        <TabsContent value="pendentes">
          <PendingTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
