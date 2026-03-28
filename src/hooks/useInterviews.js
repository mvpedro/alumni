import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')                        // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')         // strip combining diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')           // remove non-alphanumeric
    .replace(/\s+/g, '-')                    // spaces → hyphens
    .replace(/-+/g, '-')                     // collapse consecutive hyphens
}

export function useInterviews({ published } = {}) {
  return useQuery({
    queryKey: ['interviews', { published }],
    queryFn: async () => {
      let query = supabase
        .from('interviews')
        .select('*')
        .order('published_at', { ascending: false })

      if (published !== undefined) {
        query = query.eq('published', published)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useInterview(slug) {
  return useQuery({
    queryKey: ['interviews', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select('*, alumni:alumni(id, full_name)')
        .eq('slug', slug)
        .eq('published', true)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!slug,
  })
}

export function useCreateInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ coverFile, ...fields }) => {
      const { data: { user } } = await supabase.auth.getUser()

      let cover_image_url = null

      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('blog-covers')
          .upload(path, coverFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage
          .from('blog-covers')
          .getPublicUrl(path)
        cover_image_url = urlData.publicUrl
      }

      const slug = fields.slug || slugify(fields.title)
      const published_at = fields.published ? fields.published_at || new Date().toISOString() : null

      const { data, error } = await supabase
        .from('interviews')
        .insert({
          ...fields,
          slug,
          author_id: user.id,
          ...(cover_image_url ? { cover_image_url } : {}),
          published_at,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
    },
  })
}

export function useUpdateInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, coverFile, ...fields }) => {
      let cover_image_url = fields.cover_image_url

      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `${id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('blog-covers')
          .upload(path, coverFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage
          .from('blog-covers')
          .getPublicUrl(path)
        cover_image_url = urlData.publicUrl
      }

      const published_at =
        fields.published && !fields.published_at
          ? new Date().toISOString()
          : fields.published_at

      const { data, error } = await supabase
        .from('interviews')
        .update({ ...fields, cover_image_url, published_at })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
    },
  })
}

export function useDeleteInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('interviews').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
    },
  })
}
