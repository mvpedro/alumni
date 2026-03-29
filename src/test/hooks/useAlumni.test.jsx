import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAlumni } from '@/hooks/useAlumni'
import { mockSupabaseQuery } from '../mocks/supabase.js'
import { supabase } from '../mocks/supabase.js'

// ── Mock Supabase ─────────────────────────────────────────────────────────────
vi.mock('@/lib/supabase', async () => {
  const mod = await import('../mocks/supabase.js')
  return { supabase: mod.supabase }
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  function Wrapper({ children }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return Wrapper
}

const sampleAlumni = [
  { id: '1', full_name: 'Alice', job_title: 'Dev', city: 'São Paulo', entry_class: '2019.1', is_hiring: true, company: { id: 'c1', name: 'Corp A' }, alumni_badges: [] },
  { id: '2', full_name: 'Bob', job_title: 'Manager', city: 'Curitiba', entry_class: '2020.1', is_hiring: false, company: { id: 'c2', name: 'Corp B' }, alumni_badges: [] },
]

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('useAlumni', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns alumni data from Supabase', async () => {
    mockSupabaseQuery({ data: sampleAlumni, error: null, count: 2 })

    const { result } = renderHook(() => useAlumni(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data.alumni).toHaveLength(2)
    expect(result.current.data.total).toBe(2)
    expect(result.current.data.pageSize).toBe(12)
  })

  it('returns empty array when Supabase returns null data', async () => {
    mockSupabaseQuery({ data: null, error: null, count: 0 })

    const { result } = renderHook(() => useAlumni(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data.alumni).toEqual([])
    expect(result.current.data.total).toBe(0)
  })

  it('applies or() filter when search is provided', async () => {
    mockSupabaseQuery({ data: [sampleAlumni[0]], error: null, count: 1 })

    const { result } = renderHook(() => useAlumni({ search: 'Alice' }), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify or() was called on the builder with the search term
    const builder = supabase.from.mock.results[0]?.value
    expect(builder?.or).toHaveBeenCalledWith(expect.stringContaining('Alice'))
  })

  it('applies eq("is_hiring") filter when isHiring=true', async () => {
    mockSupabaseQuery({ data: [sampleAlumni[0]], error: null, count: 1 })

    const { result } = renderHook(() => useAlumni({ isHiring: true }), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const builder = supabase.from.mock.results[0]?.value
    expect(builder?.eq).toHaveBeenCalledWith('is_hiring', true)
  })

  it('applies eq("company_id") filter when company is provided', async () => {
    mockSupabaseQuery({ data: [sampleAlumni[0]], error: null, count: 1 })

    const { result } = renderHook(() => useAlumni({ company: 'c1' }), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const builder = supabase.from.mock.results[0]?.value
    expect(builder?.eq).toHaveBeenCalledWith('company_id', 'c1')
  })

  it('applies range() for pagination', async () => {
    mockSupabaseQuery({ data: sampleAlumni, error: null, count: 24 })

    const { result } = renderHook(() => useAlumni({ page: 2 }), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const builder = supabase.from.mock.results[0]?.value
    // page 2 → from=12, to=23
    expect(builder?.range).toHaveBeenCalledWith(12, 23)
  })

  it('throws and sets isError=true when Supabase returns an error', async () => {
    mockSupabaseQuery({ data: null, error: { message: 'DB error' }, count: null })

    const { result } = renderHook(() => useAlumni(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
