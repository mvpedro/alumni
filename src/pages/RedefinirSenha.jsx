import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Supabase redirects here from the recovery email with the session tokens (or an
// error such as otp_expired) in the URL hash. supabase-js consumes the hash and
// signs the user in, so we only need a session to call updateUser.
function readHashError() {
  const params = new URLSearchParams(window.location.hash.slice(1))
  return params.get('error_description') || params.get('error')
}

export default function RedefinirSenha() {
  const { session, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [hashError] = useState(readHashError)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) {
      setError(
        error.code === 'same_password'
          ? 'A nova senha deve ser diferente da senha atual.'
          : 'Não foi possível redefinir a senha. Solicite um novo link e tente novamente.'
      )
      return
    }
    toast.success('Senha redefinida com sucesso!')
    navigate('/')
  }

  const invalidLink = !authLoading && (!session || hashError)

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <img src="/alumni-logo.png" alt="Alumni Automação UFSC" className="mx-auto mb-6 h-16 w-auto rounded-2xl bg-slate-900 p-3" />

        {authLoading ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Verificando link...</CardTitle>
            </CardHeader>
          </Card>
        ) : invalidLink ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Link inválido ou expirado</CardTitle>
              <CardDescription>
                Este link de recuperação não é mais válido. Links expiram após 1 hora e só
                podem ser usados uma vez. Solicite um novo link para redefinir sua senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/esqueci-senha">
                <Button className="w-full">Solicitar novo link</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Redefinir senha</CardTitle>
              <CardDescription>
                Escolha uma nova senha para <strong>{session.user.email}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar nova senha</Label>
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar nova senha'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
