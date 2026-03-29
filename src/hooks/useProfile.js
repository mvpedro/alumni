import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useUpdateProfile() {
  const { user, refreshProfile } = useAuth()

  return useMutation({
    mutationFn: async (updates) => {
      const { data, error } = await supabase
        .from('alumni')
        .update(updates)
        .eq('profile_id', user.id)
        .select()
        .single()
      if (error) throw error

      // Sync key fields back to profiles table
      const profileSync = {}
      if (updates.full_name) profileSync.full_name = updates.full_name
      if (updates.entry_class) profileSync.entry_class = updates.entry_class
      if (Object.keys(profileSync).length > 0) {
        await supabase.from('profiles').update(profileSync).eq('id', user.id)
      }

      return data
    },
    onSuccess: () => {
      refreshProfile()
    },
  })
}

export function useUploadAvatar() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (file) => {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      return data.publicUrl
    },
  })
}
