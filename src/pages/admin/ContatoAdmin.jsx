import { useState } from 'react'
import { Mail, MailOpen } from 'lucide-react'
import { useContactMessages, useMarkMessageRead } from '@/hooks/useContactMessages'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export default function ContatoAdmin() {
  const { data: messages = [], isLoading } = useContactMessages()
  const markRead = useMarkMessageRead()
  const [selected, setSelected] = useState(null)

  function openMessage(msg) {
    setSelected(msg)
    if (!msg.read) {
      markRead.mutate(msg.id)
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Mensagens de Contato</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                </TableRow>
              ))
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Nenhuma mensagem ainda.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((msg) => (
                <TableRow
                  key={msg.id}
                  className={cn('cursor-pointer hover:bg-muted/50', !msg.read && 'font-medium')}
                  onClick={() => openMessage(msg)}
                >
                  <TableCell>
                    {msg.read ? (
                      <MailOpen className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Mail className="h-4 w-4 text-primary" />
                    )}
                  </TableCell>
                  <TableCell>{msg.name}</TableCell>
                  <TableCell className="text-muted-foreground">{msg.email}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {formatDate(msg.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Mensagem de {selected.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">E-mail: </span>
                <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                  {selected.email}
                </a>
              </div>
              <div>
                <span className="font-medium">Data: </span>
                <span className="text-muted-foreground">{formatDate(selected.created_at)}</span>
              </div>
              <div className="rounded-md bg-muted p-4">
                <p className="whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
