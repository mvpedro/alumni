import { useRef } from 'react'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile'
import { ProfileForm } from '@/components/alumni/ProfileForm'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusMap = {
  pending: { label: 'Pendente', variant: 'secondary' },
  approved: { label: 'Aprovado', variant: 'default' },
  rejected: { label: 'Rejeitado', variant: 'destructive' },
}

export default function Perfil() {
  const { profile, alumni, refreshProfile } = useAuth()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const fileInputRef = useRef(null)

  const status = statusMap[profile?.status] ?? statusMap.pending

  async function handleSubmit(values) {
    try {
      await updateProfile.mutateAsync(values)
      toast.success('Perfil atualizado com sucesso!')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao salvar perfil.')
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const publicUrl = await uploadAvatar.mutateAsync(file)
      await updateProfile.mutateAsync({ avatar_url: publicUrl })
      toast.success('Foto atualizada!')
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao enviar foto.')
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {profile?.status === 'pending' && (
        <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          Seu cadastro está aguardando aprovação. Você já pode preencher seu perfil enquanto espera.
        </div>
      )}

      {profile?.status === 'rejected' && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          Seu cadastro foi rejeitado. Entre em contato com a administração para mais informações.
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Foto de perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={alumni?.avatar_url} alt={alumni?.full_name} />
                <AvatarFallback className="text-2xl">
                  {alumni?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatar.isPending}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
              >
                <Camera className="h-3.5 w-3.5" />
                <span className="sr-only">Alterar foto</span>
              </button>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatar.isPending}
              >
                {uploadAvatar.isPending ? 'Enviando...' : 'Alterar foto'}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG ou WebP. Máximo 2 MB.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            profile={alumni}
            onSubmit={handleSubmit}
            loading={updateProfile.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
