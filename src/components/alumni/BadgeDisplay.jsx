import {
  FileText,
  Video,
  Mic,
  HeartHandshake,
  Briefcase,
  Award,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const ICON_MAP = {
  'file-text': FileText,
  video: Video,
  mic: Mic,
  'heart-handshake': HeartHandshake,
  briefcase: Briefcase,
  award: Award,
}

function BadgePill({ badge }) {
  const Icon = ICON_MAP[badge.icon] ?? Award
  const color = badge.color ?? '#0d9488'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
          style={{
            borderColor: color,
            color,
            backgroundColor: `${color}18`,
          }}
        >
          <Icon className="h-3 w-3 shrink-0" />
          {badge.name}
        </span>
      </TooltipTrigger>
      {badge.description && (
        <TooltipContent side="top">
          <p className="max-w-xs text-xs">{badge.description}</p>
        </TooltipContent>
      )}
    </Tooltip>
  )
}

/**
 * BadgeDisplay
 * @param {{ badges: Array<{ id, slug, name, description, icon, color }> }} props
 */
export function BadgeDisplay({ badges }) {
  if (!badges || badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <BadgePill key={badge.id ?? badge.slug} badge={badge} />
      ))}
    </div>
  )
}
