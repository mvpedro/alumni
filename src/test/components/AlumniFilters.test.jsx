import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AlumniFilters } from '@/components/alumni/AlumniFilters'
import { mockSupabaseQuery } from '../mocks/supabase.js'

// ── Mock Supabase ─────────────────────────────────────────────────────────────
vi.mock('@/lib/supabase', async () => {
  const mod = await import('../mocks/supabase.js')
  return { supabase: mod.supabase }
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
}

const emptyFilters = {
  search: '',
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
}

const filtersWithValues = {
  ...emptyFilters,
  sector: 'sec-1',
  company: 'comp-1',
  city: 'Florianópolis',
}

function renderFilters({ filters = emptyFilters, onChange = vi.fn(), isAdmin = false } = {}) {
  const client = makeClient()
  return {
    onChange,
    ...render(
      <QueryClientProvider client={client}>
        <AlumniFilters filters={filters} onChange={onChange} isAdmin={isAdmin} />
      </QueryClientProvider>
    ),
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('AlumniFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // All lookup queries return empty arrays
    mockSupabaseQuery({ data: [], error: null })
  })

  it('renders the Filtros heading', () => {
    renderFilters()
    expect(screen.getByText('Filtros')).toBeInTheDocument()
  })

  it('renders Setor, Empresa, Cidade and Turma filter labels', () => {
    renderFilters()
    expect(screen.getByText('Setor')).toBeInTheDocument()
    expect(screen.getByText('Empresa')).toBeInTheDocument()
    expect(screen.getByText('Cidade')).toBeInTheDocument()
    expect(screen.getByText('Turma de entrada')).toBeInTheDocument()
  })

  it('renders mentoring and hiring toggles', () => {
    renderFilters()
    expect(screen.getByText('Apenas mentores')).toBeInTheDocument()
    expect(screen.getByText('Apenas contratando')).toBeInTheDocument()
  })

  it('does NOT render admin-only section when isAdmin=false', () => {
    renderFilters({ isAdmin: false })
    expect(screen.queryByText('Disponível para Trabalho Alumni')).not.toBeInTheDocument()
    expect(screen.queryByText('Apenas graduandos')).not.toBeInTheDocument()
  })

  it('renders admin-only section when isAdmin=true', () => {
    renderFilters({ isAdmin: true })
    expect(screen.getByText('Disponível para Trabalho Alumni')).toBeInTheDocument()
    expect(screen.getByText('Disponível para Entrevista em texto')).toBeInTheDocument()
    expect(screen.getByText('Disponível para Alumni Talk')).toBeInTheDocument()
    expect(screen.getByText('Disponível para Semana Acadêmica')).toBeInTheDocument()
    expect(screen.getByText('Apenas graduandos')).toBeInTheDocument()
  })

  it('shows "Limpar" button only when there are active filters', () => {
    const { rerender, onChange } = renderFilters({ filters: emptyFilters })
    expect(screen.queryByText('Limpar')).not.toBeInTheDocument()

    const client = makeClient()
    rerender(
      <QueryClientProvider client={client}>
        <AlumniFilters filters={filtersWithValues} onChange={onChange} isAdmin={false} />
      </QueryClientProvider>
    )
    expect(screen.getByText('Limpar')).toBeInTheDocument()
  })

  it('calls onChange with cleared filters when "Limpar" is clicked', () => {
    const onChange = vi.fn()
    const client = makeClient()
    render(
      <QueryClientProvider client={client}>
        <AlumniFilters filters={filtersWithValues} onChange={onChange} isAdmin={false} />
      </QueryClientProvider>
    )

    fireEvent.click(screen.getByText('Limpar'))

    expect(onChange).toHaveBeenCalledOnce()
    const call = onChange.mock.calls[0][0]
    expect(call.sector).toBe('')
    expect(call.company).toBe('')
    expect(call.city).toBe('')
    expect(call.entryClass).toBe('')
    expect(call.page).toBe(1)
  })

  it('preserves search value when clearing filters', () => {
    const onChange = vi.fn()
    const client = makeClient()
    render(
      <QueryClientProvider client={client}>
        <AlumniFilters
          filters={{ ...filtersWithValues, search: 'João' }}
          onChange={onChange}
          isAdmin={false}
        />
      </QueryClientProvider>
    )

    fireEvent.click(screen.getByText('Limpar'))

    const call = onChange.mock.calls[0][0]
    expect(call.search).toBe('João')
  })
})
