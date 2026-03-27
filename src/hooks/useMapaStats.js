import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMapaStats() {
  return useQuery({
    queryKey: ['mapa-stats'],
    queryFn: async () => {
      const [profilesRes, companiesRes, sectorsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, entry_class, state, company_id, company:companies(id, sector_id)')
          .eq('status', 'approved'),
        supabase
          .from('companies')
          .select('id, name, logo_url, alumni_count, sector_id, sector:sectors(id, name)')
          .eq('status', 'approved'),
        supabase
          .from('sectors')
          .select('id, name')
          .order('display_order'),
      ])

      if (profilesRes.error) throw profilesRes.error
      if (sectorsRes.error) throw sectorsRes.error

      const profiles = profilesRes.data ?? []
      const companies = companiesRes.data ?? []
      const sectors = sectorsRes.data ?? []

      // Total counts
      const totalAlumni = profiles.length
      const totalCompanies = companies.length
      const totalSectors = sectors.length

      // Unique entry classes
      const classes = new Set(profiles.map((p) => p.entry_class).filter(Boolean))
      const totalClasses = classes.size

      // Alumni per sector
      const sectorCountMap = {}
      profiles.forEach((p) => {
        const sectorId = p.company?.sector_id
        if (sectorId) {
          sectorCountMap[sectorId] = (sectorCountMap[sectorId] ?? 0) + 1
        }
      })
      const alumniPerSector = sectors
        .map((s) => ({ name: s.name, count: sectorCountMap[s.id] ?? 0 }))
        .filter((s) => s.count > 0)

      // Alumni per class (chronological)
      const classCountMap = {}
      profiles.forEach((p) => {
        if (p.entry_class) {
          classCountMap[p.entry_class] = (classCountMap[p.entry_class] ?? 0) + 1
        }
      })
      const alumniPerClass = Object.entries(classCountMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => String(a.name).localeCompare(String(b.name)))

      // Alumni per state (top 10)
      const stateCountMap = {}
      profiles.forEach((p) => {
        if (p.state) {
          stateCountMap[p.state] = (stateCountMap[p.state] ?? 0) + 1
        }
      })
      const alumniPerState = Object.entries(stateCountMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Logo cluster — group companies by sector, sorted by alumni_count
      const sectorMap = {}
      sectors.forEach((s) => {
        sectorMap[s.id] = { id: s.id, name: s.name, companies: [] }
      })
      companies.forEach((c) => {
        if (c.sector_id && sectorMap[c.sector_id]) {
          sectorMap[c.sector_id].companies.push({
            id: c.id,
            name: c.name,
            logo_url: c.logo_url,
            alumni_count: c.alumni_count ?? 0,
          })
        }
      })
      const logoCluster = Object.values(sectorMap)
        .filter((s) => s.companies.length > 0)
        .map((s) => ({
          ...s,
          companies: s.companies.sort((a, b) => b.alumni_count - a.alumni_count),
        }))
        .sort((a, b) => {
          const aTotal = a.companies.reduce((sum, c) => sum + c.alumni_count, 0)
          const bTotal = b.companies.reduce((sum, c) => sum + c.alumni_count, 0)
          return bTotal - aTotal
        })

      return {
        totalAlumni,
        totalCompanies,
        totalSectors,
        totalClasses,
        alumniPerSector,
        alumniPerClass,
        alumniPerState,
        logoCluster,
      }
    },
  })
}
