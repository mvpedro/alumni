import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) {
      setError('Erro ao enviar email. Verifique o endereço e tente novamente.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <img src="/alumni-logo.png" alt="Alumni Automação UFSC" className="mx-auto mb-6 h-16 w-auto rounded-2xl bg-slate-900 p-3" />

        {sent ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Email enviado!</CardTitle>
              <CardDescription>
                Se existe uma conta com o email <strong>{email}</strong>, você receberá
                um link para redefinir sua senha. Verifique sua caixa de entrada e spam.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button className="w-full">Voltar para Login</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Esqueci minha senha</CardTitle>
              <CardDescription>
                Informe seu email e enviaremos um link para redefinir sua senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Lembrou a senha?{' '}
                  <Link to="/login" className="text-primary underline">Entrar</Link>
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
