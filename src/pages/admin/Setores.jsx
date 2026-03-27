import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSectors, useCreateSector, useDeleteSector } from '@/hooks/useSectors'
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
import { Skeleton } from '@/components/ui/skeleton'

export default function Setores() {
  const { data: sectors = [], isLoading } = useSectors()
  const createSector = useCreateSector()
  const deleteSector = useDeleteSector()

  const [newName, setNewName] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    try {
      const nextOrder = sectors.length > 0
        ? Math.max(...sectors.map((s) => s.display_order ?? 0)) + 1
        : 1
      await createSector.mutateAsync({ name: trimmed, display_order: nextOrder })
      setNewName('')
      toast.success('Setor criado.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao criar setor.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este setor?')) return
    try {
      await deleteSector.mutateAsync(id)
      toast.success('Setor excluído.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao excluir setor.')
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Setores</h1>

      {/* Inline create form */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <Input
          placeholder="Nome do novo setor..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" size="sm" disabled={createSector.isPending || !newName.trim()}>
          <Plus className="mr-1.5 h-4 w-4" />
          Adicionar
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Ordem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-20 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : sectors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  Nenhum setor cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              sectors.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell className="text-muted-foreground">{sector.display_order}</TableCell>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={deleteSector.isPending}
                      onClick={() => handleDelete(sector.id)}
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
    </div>
  )
}
