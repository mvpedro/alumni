import { useState } from 'react'
import { ChevronDown, ChevronRight, Award, FileText, Video, Mic, HeartHandshake, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import { useBadgesAdmin, useAwardBadge, useRevokeBadge } from '@/hooks/useBadges'
import { useAllAlumni } from '@/hooks/useAlumni'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Combobox } from '@/components/common/Combobox'

const ICON_MAP = {
  'file-text': FileText,
  video: Video,
  mic: Mic,
  'heart-handshake': HeartHandshake,
  briefcase: Briefcase,
  award: Award,
}

function BadgeIcon({ icon, color, className = 'h-4 w-4' }) {
  const Icon = ICON_MAP[icon] ?? Award
  return <Icon className={className} style={{ color }} />
}

function AwardRow({ award, onRevoke, revoking }) {
  return (
    <div className="flex items-center justify-between rounded border px-3 py-2 text-sm">
      <div>
        <span className="font-medium">{award.alumni?.full_name ?? '—'}</span>
        <span className="ml-2 text-xs text-muted-foreground">
          {new Date(award.awarded_at).toLocaleDateString('pt-BR')}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-destructive hover:text-destructive"
        disabled={revoking}
        onClick={() => onRevoke(award)}
      >
        Revogar
      </Button>
    </div>
  )
}

function BadgeRow({ badge }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedAlumni, setSelectedAlumni] = useState('')
  const { data: allAlumni = [] } = useAllAlumni()
  const awardBadge = useAwardBadge()
  const revokeBadge = useRevokeBadge()

  const alumniOptions = allAlumni.map((a) => ({ value: a.id, label: a.full_name }))
  const awards = badge.alumni_badges ?? []
  const awardedIds = new Set(awards.map((a) => a.alumni?.id).filter(Boolean))
  const availableAlumni = alumniOptions.filter((o) => !awardedIds.has(o.value))

  async function handleAward() {
    if (!selectedAlumni) return
    try {
      await awardBadge.mutateAsync({ alumniId: selectedAlumni, badgeId: badge.id })
      toast.success('Badge concedido.')
      setSelectedAlumni('')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao conceder badge.')
    }
  }

  async function handleRevoke(award) {
    if (!confirm(`Revogar badge "${badge.name}" de ${award.alumni?.full_name ?? '?'}?`)) return
    try {
      await revokeBadge.mutateAsync({ awardId: award.id, alumniId: award.alumni?.id })
      toast.success('Badge revogado.')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao revogar badge.')
    }
  }

  return (
    <>
      <TableRow
        className="cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <BadgeIcon icon={badge.icon} color={badge.color} />
            <span className="font-medium">{badge.name}</span>
          </div>
        </TableCell>
        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
          {badge.description ?? '—'}
        </TableCell>
        <TableCell>
          <span
            className="inline-block h-3 w-3 rounded-full border"
            style={{ backgroundColor: badge.color }}
          />
        </TableCell>
        <TableCell className="text-right tabular-nums font-medium">
          {awards.length}
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={4} className="bg-muted/20 p-4">
            <div className="space-y-3">
              {/* Award to new alumni */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Combobox
                    options={availableAlumni}
                    value={selectedAlumni}
                    onChange={setSelectedAlumni}
                    placeholder="Selecionar alumni..."
                    searchPlaceholder="Buscar alumni..."
                    emptyMessage="Nenhum alumni disponível."
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleAward}
                  disabled={!selectedAlumni || awardBadge.isPending}
                >
                  Conceder
                </Button>
              </div>

              {/* Current awards */}
              {awards.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum alumni com este badge.</p>
              ) : (
                <div className="space-y-1.5">
                  {awards.map((award) => (
                    <AwardRow
                      key={award.id}
                      award={award}
                      onRevoke={handleRevoke}
                      revoking={revokeBadge.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default function BadgesAdmin() {
  const { data: badges = [], isLoading } = useBadgesAdmin()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Badges</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os badges concedidos aos alumni. Clique em uma linha para expandir.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Badge</TableHead>
              <TableHead className="hidden sm:table-cell">Descrição</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead className="text-right">Concedidos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-3 w-3 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-6" /></TableCell>
                </TableRow>
              ))
            ) : badges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Nenhum badge cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              badges.map((badge) => (
                <BadgeRow key={badge.id} badge={badge} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
