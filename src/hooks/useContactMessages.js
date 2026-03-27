import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useContactMessages() {
  return useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useSendContactMessage() {
  return useMutation({
    mutationFn: async ({ name, email, message }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({ name, email, message, read: false })
        .select()
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
    },
  })
}
