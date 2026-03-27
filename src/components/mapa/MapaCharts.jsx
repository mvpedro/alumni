import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TEAL_COLORS = [
  '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4',
  '#99f6e4', '#0f766e', '#0891b2', '#06b6d4',
  '#22d3ee', '#67e8f9',
]

export function MapaCharts({ alumniPerSector, alumniPerClass, alumniPerState }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Pie chart - alumni by sector */}
      {alumniPerSector?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alumni por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={alumniPerSector}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                  }
                  labelLine={false}
                >
                  {alumniPerSector.map((_, i) => (
                    <Cell key={i} fill={TEAL_COLORS[i % TEAL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Bar chart - alumni by class (vertical bars) */}
      {alumniPerClass?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alumni por Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={alumniPerClass} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Alumni" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Bar chart - alumni by state (horizontal, full width) */}
      {alumniPerState?.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Alumni por Estado (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={alumniPerState}
                layout="vertical"
                margin={{ top: 5, right: 30, bottom: 5, left: 30 }}
              >
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={40} />
                <Tooltip />
                <Bar dataKey="count" name="Alumni" fill="#14b8a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
