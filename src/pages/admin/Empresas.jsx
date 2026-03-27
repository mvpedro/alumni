import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies'
import { CompanyForm } from '@/components/admin/CompanyForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function Empresas() {
  const { data: companies = [], isLoading } = useCompanies()
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()
  const deleteCompany = useDeleteCompany()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const filtered = companies.filter(
    (c) => search === '' || c.name.toLowerCase().includes(search.toLowerCase())
  )

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

  const isSaving = createCompany.isPending || updateCompany.isPending

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nova empresa
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Buscar empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
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
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {company.sector?.name ?? '—'}
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
