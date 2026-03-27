import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAlumni } from '@/hooks/useAlumni'
import { useAuth } from '@/contexts/AuthContext'
import { AlumniCard } from '@/components/alumni/AlumniCard'
import { AlumniFilters } from '@/components/alumni/AlumniFilters'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

const defaultFilters = {
  search: '',
  sector: '',
  company: '',
  city: '',
  entryClass: '',
  openToMentoring: false,
  page: 1,
}

export default function BancoDeDados() {
  const [filters, setFilters] = useState(defaultFilters)
  const { isAuthenticated, isApproved } = useAuth()
  const anonymous = !isAuthenticated || !isApproved

  const { data, isLoading } = useAlumni(filters)
  const alumni = data?.alumni ?? []
  const total = data?.total ?? 0
  const pageSize = data?.pageSize ?? 12

  function handleSearchChange(value) {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }))
  }

  function handlePageChange(newPage) {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Banco de Dados</h1>

      {anonymous && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
          <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="flex-1 text-sm text-muted-foreground">
            Nomes e informações de contato estão ocultos. Faça login para ver os perfis completos.
          </div>
          <Link to="/login"><Button size="sm">Entrar</Button></Link>
        </div>
      )}

      {!anonymous && (
        <div className="mb-6">
          <SearchBar
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Buscar por nome ou cargo..."
          />
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-64 lg:shrink-0">
          <AlumniFilters filters={filters} onChange={setFilters} />
        </div>

        <div className="flex-1">
          <div className="mb-4 text-sm text-muted-foreground">
            {isLoading ? 'Carregando...' : `${total} ${total === 1 ? 'resultado' : 'resultados'}`}
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : alumni.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              Nenhum alumni encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {alumni.map((a) => (
                <AlumniCard key={a.id} alumni={a} anonymous={anonymous} />
              ))}
            </div>
          )}

          {!isLoading && total > pageSize && (
            <div className="mt-8">
              <Pagination
                page={filters.page}
                total={total}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
