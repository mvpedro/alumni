import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function usePalestras({ category } = {}) {
  return useQuery({
    queryKey: ['palestras', { category }],
    queryFn: async () => {
      let query = supabase
        .from('palestras')
        .select('*, alumni:alumni(id, full_name)')
        .eq('published', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
      if (category) {
        query = query.eq('category', category)
      }
      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAllPalestras() {
  return useQuery({
    queryKey: ['palestras-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('palestras')
        .select('*, alumni:alumni(id, full_name)')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreatePalestra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (fields) => {
      const { data, error } = await supabase
        .from('palestras')
        .insert(fields)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['palestras'] })
      qc.invalidateQueries({ queryKey: ['palestras-all'] })
    },
  })
}

export function useUpdatePalestra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const { data, error } = await supabase
        .from('palestras')
        .update(fields)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['palestras'] })
      qc.invalidateQueries({ queryKey: ['palestras-all'] })
    },
  })
}

export function useDeletePalestra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('palestras').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['palestras'] })
      qc.invalidateQueries({ queryKey: ['palestras-all'] })
    },
  })
}
