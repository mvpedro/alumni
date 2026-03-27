import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const PAGE_SIZE = 12

export function useAlumni({ search = '', sector = '', company = '', city = '', entryClass = '', openToMentoring = false, page = 1 } = {}) {
  return useQuery({
    queryKey: ['alumni', { search, sector, company, city, entryClass, openToMentoring, page }],
    queryFn: async () => {
      let query = supabase
        .from('alumni')
        .select('*, company:companies(id, name, logo_url, sector:sectors(id, name))', { count: 'exact' })

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,job_title.ilike.%${search}%`)
      }
      if (sector) {
        query = query.eq('company.sector_id', sector)
      }
      if (company) {
        query = query.eq('company_id', company)
      }
      if (city) {
        query = query.ilike('city', `%${city}%`)
      }
      if (entryClass) {
        query = query.eq('entry_class', entryClass)
      }
      if (openToMentoring) {
        query = query.eq('open_to_mentoring', true)
      }

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      query = query.range(from, to).order('full_name')

      const { data, error, count } = await query
      if (error) throw error
      return { alumni: data ?? [], total: count ?? 0, pageSize: PAGE_SIZE }
    },
  })
}
