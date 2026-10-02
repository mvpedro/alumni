import ReactMarkdown from 'react-markdown'
import { Briefcase, ExternalLink, Laptop, Link2, Mail, MapPin, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AREA_LABELS, JOB_TYPE_LABELS, WORK_MODE_LABELS, companyLabel, formatSalary } from '@/hooks/useOportunidades'
import { CompanyLogo } from '@/components/oportunidades/OportunidadeCard'

const markdown = {
  p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">{children}</a>,
}

function Section({ title, children }) {
  if (!children) return null
  return (
    <section>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <div className="text-sm text-muted-foreground">
        <ReactMarkdown components={markdown}>{children}</ReactMarkdown>
      </div>
    </section>
  )
}

function Meta({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  )
}

export function OportunidadeDetail({ op, open, onOpenChange }) {
  if (!op) return null
  const salary = formatSalary(op)
  const publishedAt = op.published_at ? new Date(op.published_at).toLocaleDateString('pt-BR') : null
  const expiresAt = new Date(`${op.expires_at}T00:00:00`).toLocaleDateString('pt-BR')
  const mailto = op.apply_email
    ? `mailto:${op.apply_email}?subject=${encodeURIComponent(`Candidatura: ${op.title}`)}`
    : null

  function copyLink() {
    const url = `${window.location.origin}/oportunidades?vaga=${op.id}`
    navigator.clipboard?.writeText(url).then(() => toast.success('Link copiado!'))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-start gap-4">
            <CompanyLogo op={op} className="h-14 w-14" />
            <div className="min-w-0">
              <DialogTitle className="text-xl leading-snug">{op.title}</DialogTitle>
              <DialogDescription className="mt-1">{companyLabel(op)}</DialogDescription>
              <p className="mt-1 text-xs text-muted-foreground">
                {publishedAt && <>Publicada em {publishedAt} · </>}Válida até {expiresAt}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Meta icon={Briefcase}>{JOB_TYPE_LABELS[op.job_type]}</Meta>
          <Meta icon={Laptop}>{WORK_MODE_LABELS[op.work_mode]}</Meta>
          {op.location && <Meta icon={MapPin}>{op.location}</Meta>}
          {salary && <Meta icon={Wallet}>{salary}</Meta>}
          <Badge variant="outline">{AREA_LABELS[op.area]}</Badge>
        </div>

        <div className="space-y-5">
          <Section title="Sobre a vaga">{op.description}</Section>
          <Section title="Principais atividades">{op.activities}</Section>
          <Section title="Requisitos">{op.requirements}</Section>
        </div>

        <div className="space-y-2 border-t pt-4">
          {op.apply_url ? (
            <Button asChild className="w-full">
              <a href={op.apply_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Candidatar-se
              </a>
            </Button>
          ) : (
            <Button asChild className="w-full">
              <a href={mailto}>
                <Mail className="mr-2 h-4 w-4" />
                Candidatar-se por e-mail
              </a>
            </Button>
          )}
          {op.apply_url && op.apply_email && (
            <p className="text-center text-xs text-muted-foreground">
              ou envie seu currículo para{' '}
              <a href={mailto} className="text-primary underline">{op.apply_email}</a>
            </p>
          )}
          <Button variant="ghost" size="sm" className="w-full" onClick={copyLink}>
            <Link2 className="mr-2 h-4 w-4" />
            Copiar link da vaga
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
