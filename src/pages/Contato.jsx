import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSendContactMessage } from '@/hooks/useContactMessages'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function Contato() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [success, setSuccess] = useState(false)
  const sendMessage = useSendContactMessage()

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await sendMessage.mutateAsync(form)
      setSuccess(true)
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao enviar mensagem.')
    }
  }

  if (success) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
        <h1 className="text-2xl font-bold">Mensagem enviada!</h1>
        <p className="mt-2 text-muted-foreground">
          Obrigado pelo contato. Responderemos em breve.
        </p>
        <Button className="mt-6" onClick={() => { setSuccess(false); setForm({ name: '', email: '', message: '' }) }}>
          Enviar outra mensagem
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Contato</CardTitle>
          <CardDescription>
            Envie uma mensagem para a equipe Alumni Automação UFSC.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                required
                placeholder="Sua mensagem..."
              />
            </div>
            <Button type="submit" disabled={sendMessage.isPending} className="w-full">
              {sendMessage.isPending ? 'Enviando...' : 'Enviar mensagem'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
