import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const AREA_LABELS = {
  engenharia: 'Engenharia',
  software: 'Software',
  dados: 'Dados',
  produto: 'Produto',
  gestao: 'Gestão / Negócios',
  pesquisa: 'Pesquisa',
  outro: 'Outro',
}

export const JOB_TYPE_LABELS = {
  clt: 'CLT',
  pj: 'PJ',
  estagio: 'Estágio',
  trainee: 'Trainee',
  freelance: 'Freelance',
  outro: 'Outro',
}

export const WORK_MODE_LABELS = {
  presencial: 'Presencial',
  hibrido: 'Híbrido',
  remoto: 'Remoto',
}

export const STATUS_LABELS = {
  pending: 'Em análise',
  published: 'Publicada',
  rejected: 'Rejeitada',
  closed: 'Encerrada',
}

const SELECT = '*, company:companies(id, name, logo_url)'

export function companyLabel(op) {
  return op.company?.name || op.company_name || ''
}

export function formatSalary(op) {
  const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  if (op.salary_min && op.salary_max) return `${fmt(op.salary_min)} – ${fmt(op.salary_max)}`
  if (op.salary_min) return `A partir de ${fmt(op.salary_min)}`
  if (op.salary_max) return `Até ${fmt(op.salary_max)}`
  return null
}

// Public listing — RLS already restricts anonymous reads to published, non-expired
// posts, but owners/admins can see more, so filter explicitly.
export function useOportunidades() {
  return useQuery({
    queryKey: ['oportunidades'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10)
      const { data, error } = await supabase
        .from('oportunidades')
        .select(SELECT)
        .eq('status', 'published')
        .gte('expires_at', today)
        .order('published_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useMyOportunidades(userId) {
  return useQuery({
    queryKey: ['oportunidades-mine', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('oportunidades')
        .select(SELECT)
        .eq('posted_by', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAllOportunidades() {
  return useQuery({
    queryKey: ['oportunidades-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('oportunidades')
        .select(`${SELECT}, poster:profiles(id, full_name)`)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

function useInvalidate() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['oportunidades'] })
    qc.invalidateQueries({ queryKey: ['oportunidades-mine'] })
    qc.invalidateQueries({ queryKey: ['oportunidades-all'] })
  }
}

export function useCreateOportunidade() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (fields) => {
      const { data, error } = await supabase
        .from('oportunidades')
        .insert(fields)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: invalidate,
  })
}

export function useUpdateOportunidade() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const { data, error } = await supabase
        .from('oportunidades')
        .update(fields)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: invalidate,
  })
}

export function useDeleteOportunidade() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('oportunidades').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}
