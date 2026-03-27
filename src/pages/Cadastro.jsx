import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Cadastro() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', entryClass: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      entryClass: form.entryClass,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Conta criada!</CardTitle>
            <CardDescription>
              Aguarde aprovação de um administrador para acessar o Banco de Dados e o Mapa dos Egressos. Enquanto isso, você já pode completar seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login"><Button className="w-full">Ir para Login</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
      <img src="/alumni-logo.png" alt="Alumni Automação UFSC" className="mx-auto mb-6 h-16 w-auto" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>Crie sua conta no Alumni Automação UFSC</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input id="fullName" value={form.fullName} onChange={updateField('fullName')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={updateField('email')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={form.password} onChange={updateField('password')} minLength={6} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entryClass">Turma de entrada (ex: 2017.2)</Label>
              <Input id="entryClass" value={form.entryClass} onChange={updateField('entryClass')} placeholder="2017.2" pattern="\d{4}\.[12]" title="Formato: YYYY.1 ou YYYY.2" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}<Link to="/login" className="text-primary underline">Entrar</Link>
            </p>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
