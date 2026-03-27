import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useTrabalhoAlumni({ published } = {}) {
  return useQuery({
    queryKey: ['trabalho-alumni', { published }],
    queryFn: async () => {
      let query = supabase
        .from('trabalho_alumni')
        .select('*')
        .order('display_order', { ascending: true })
      if (published !== undefined) {
        query = query.eq('published', published)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useCreateVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (fields) => {
      const { data, error } = await supabase
        .from('trabalho_alumni')
        .insert(fields)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trabalho-alumni'] }),
  })
}

export function useUpdateVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const { data, error } = await supabase
        .from('trabalho_alumni')
        .update(fields)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trabalho-alumni'] }),
  })
}

export function useDeleteVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('trabalho_alumni').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trabalho-alumni'] }),
  })
}
