import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Get all unlinked alumni (profile_id is null)
export function useUnlinkedAlumni() {
  return useQuery({
    queryKey: ['unlinked-alumni'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alumni')
        .select('id, full_name, entry_class, contact_email')
        .is('profile_id', null)
        .order('full_name')
      if (error) throw error
      return data
    },
  })
}

// Link a user to an alumni record
export function useLinkAlumni() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ alumniId, profileId }) => {
      const { error } = await supabase
        .from('alumni')
        .update({ profile_id: profileId })
        .eq('id', alumniId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['unlinked-alumni'] })
    },
  })
}

// Unlink
export function useUnlinkAlumni() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (alumniId) => {
      const { error } = await supabase
        .from('alumni')
        .update({ profile_id: null })
        .eq('id', alumniId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['unlinked-alumni'] })
    },
  })
}
