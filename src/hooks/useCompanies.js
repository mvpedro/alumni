import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*, sector:sectors(name)')
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ logoFile, ...fields }) => {
      let logo_url = null

      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(path, logoFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage
          .from('company-logos')
          .getPublicUrl(path)
        logo_url = urlData.publicUrl
      }

      const { data, error } = await supabase
        .from('companies')
        .insert({ ...fields, ...(logo_url ? { logo_url } : {}) })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, logoFile, ...fields }) => {
      let logo_url = fields.logo_url

      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `${id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(path, logoFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage
          .from('company-logos')
          .getPublicUrl(path)
        logo_url = urlData.publicUrl
      }

      const { data, error } = await supabase
        .from('companies')
        .update({ ...fields, logo_url })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('companies').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export function useSuggestCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, sector_id, website, logoFile }) => {
      const userId = (await supabase.auth.getUser()).data.user.id
      const { data, error } = await supabase
        .from('companies')
        .insert({ name, sector_id, website, status: 'pending', submitted_by: userId })
        .select()
        .single()
      if (error) throw error
      if (logoFile) {
        const path = `${data.id}.${logoFile.name.split('.').pop()}`
        await supabase.storage.from('company-logos').upload(path, logoFile)
        const publicUrl = supabase.storage.from('company-logos').getPublicUrl(path).data.publicUrl
        await supabase.from('companies').update({ logo_url: publicUrl }).eq('id', data.id)
      }
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  })
}

export function useApproveCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('companies').update({ status: 'approved' }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  })
}

export function usePendingCompanies() {
  return useQuery({
    queryKey: ['companies', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*, sector:sectors(id, name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
