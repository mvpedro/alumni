import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useSectors() {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('display_order')
      if (error) throw error
      return data
    },
  })
}

export function useCreateSector() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fields) => {
      const { data, error } = await supabase
        .from('sectors')
        .insert(fields)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] })
    },
  })
}

export function useUpdateSector() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const { data, error } = await supabase
        .from('sectors')
        .update(fields)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] })
    },
  })
}

export function useDeleteSector() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('sectors').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] })
    },
  })
}
