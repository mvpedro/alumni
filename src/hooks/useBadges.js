import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/** All badge definitions */
export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('name')
      if (error) throw error
      return data ?? []
    },
  })
}

/** Badges awarded to a specific alumni (with badge details joined) */
export function useAlumniBadges(alumniId) {
  return useQuery({
    queryKey: ['alumni-badges', alumniId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alumni_badges')
        .select('id, awarded_at, badge:badges(id, slug, name, description, icon, color)')
        .eq('alumni_id', alumniId)
        .order('awarded_at')
      if (error) throw error
      return (data ?? []).map((row) => ({ ...row.badge, awardedAt: row.awarded_at, awardId: row.id }))
    },
    enabled: !!alumniId,
  })
}

/** Award a badge to an alumni */
export function useAwardBadge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ alumniId, badgeId }) => {
      const { data, error } = await supabase
        .from('alumni_badges')
        .insert({ alumni_id: alumniId, badge_id: badgeId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, { alumniId }) => {
      queryClient.invalidateQueries({ queryKey: ['alumni-badges', alumniId] })
      queryClient.invalidateQueries({ queryKey: ['alumni'] })
      queryClient.invalidateQueries({ queryKey: ['badges-admin'] })
    },
  })
}

/** Revoke a badge from an alumni */
export function useRevokeBadge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ awardId, alumniId }) => {
      const { error } = await supabase
        .from('alumni_badges')
        .delete()
        .eq('id', awardId)
      if (error) throw error
    },
    onSuccess: (_data, { alumniId }) => {
      queryClient.invalidateQueries({ queryKey: ['alumni-badges', alumniId] })
      queryClient.invalidateQueries({ queryKey: ['alumni'] })
      queryClient.invalidateQueries({ queryKey: ['badges-admin'] })
    },
  })
}

/** All badge awards with alumni info — for admin use */
export function useBadgesAdmin() {
  return useQuery({
    queryKey: ['badges-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*, alumni_badges(id, awarded_at, alumni:alumni(id, full_name))')
        .order('name')
      if (error) throw error
      return data ?? []
    },
  })
}
