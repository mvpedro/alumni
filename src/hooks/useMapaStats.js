import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMapaStats() {
  return useQuery({
    queryKey: ['mapa-stats'],
    queryFn: async () => {
      const [statsRes, companiesRes, sectorsRes, classesRes, statesRes] =
        await Promise.all([
          supabase.from('mapa_stats').select('*').single(),
          supabase.from('company_alumni_counts').select('*'),
          supabase.from('sector_alumni_counts').select('*'),
          supabase.from('class_alumni_counts').select('*'),
          supabase.from('state_alumni_counts').select('*'),
        ])

      if (statsRes.error) throw statsRes.error

      const stats = statsRes.data
      const companies = companiesRes.data ?? []
      const alumniPerSector = (sectorsRes.data ?? []).map((s) => ({
        name: s.sector_name,
        count: s.alumni_count,
      }))
      const alumniPerClass = (classesRes.data ?? []).map((c) => ({
        name: c.entry_class,
        count: c.alumni_count,
      }))
      const alumniPerState = (statesRes.data ?? []).map((s) => ({
        name: s.state,
        count: s.alumni_count,
      }))

      // Build logo cluster grouped by sector
      const sectorGroups = {}
      companies.forEach((c) => {
        const sectorName = c.sector_name || 'Não classificado'
        if (!sectorGroups[sectorName]) {
          sectorGroups[sectorName] = { sector: sectorName, companies: [] }
        }
        sectorGroups[sectorName].companies.push({
          id: c.company_id,
          name: c.company_name,
          logo_url: c.logo_url,
          alumni_count: c.alumni_count,
        })
      })

      const logoCluster = Object.values(sectorGroups)
        .map((g) => ({
          ...g,
          companies: g.companies.sort((a, b) => b.alumni_count - a.alumni_count),
        }))
        .sort((a, b) => {
          const aTotal = a.companies.reduce((sum, c) => sum + c.alumni_count, 0)
          const bTotal = b.companies.reduce((sum, c) => sum + c.alumni_count, 0)
          return bTotal - aTotal
        })

      return {
        totalAlumni: stats.total_alumni,
        totalCompanies: stats.total_companies,
        totalSectors: stats.total_sectors,
        totalClasses: stats.total_classes,
        alumniPerSector,
        alumniPerClass,
        alumniPerState,
        logoCluster,
      }
    },
  })
}
