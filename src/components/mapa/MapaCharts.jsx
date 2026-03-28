import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SECTOR_COLORS = [
  '#0d9488', '#14b8a6', '#2dd4bf', '#0f766e', '#0891b2',
  '#06b6d4', '#22d3ee', '#5eead4', '#99f6e4', '#67e8f9',
  '#115e59', '#134e4a', '#0e7490',
]

export function MapaCharts({ alumniPerSector, alumniPerClass, alumniPerState }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Horizontal bar chart - alumni by sector (no more pie chart) */}
      {alumniPerSector?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alumni por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(280, alumniPerSector.length * 32)}>
              <BarChart
                data={alumniPerSector}
                layout="vertical"
                margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
              >
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={130}
                />
                <Tooltip formatter={(v) => [v, 'Egressos']} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {alumniPerSector.map((_, i) => (
                    <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Bar chart - alumni by class, auto-interval to prevent overlap */}
      {alumniPerClass?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alumni por Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={alumniPerClass}
                margin={{ top: 5, right: 10, bottom: 50, left: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-60}
                  textAnchor="end"
                  interval={Math.max(0, Math.floor(alumniPerClass.length / 25))}
                  height={60}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, 'Egressos']} />
                <Bar dataKey="count" name="Alumni" fill="#0d9488" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Bar chart - alumni by state (horizontal, full width) */}
      {alumniPerState?.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Alumni por Localização</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(250, alumniPerState.length * 30)}>
              <BarChart
                data={alumniPerState}
                layout="vertical"
                margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
              >
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v) => [v, 'Egressos']} />
                <Bar dataKey="count" name="Alumni" fill="#14b8a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
