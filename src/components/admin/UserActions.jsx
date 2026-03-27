import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, MoreHorizontal, ShieldCheck, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function useUpdateUserProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function UserActions({ user }) {
  const update = useUpdateUserProfile()
  const isPending = user.status === 'pending'

  async function handleAction(updates, successMsg) {
    try {
      await update.mutateAsync({ id: user.id, ...updates })
      toast.success(successMsg)
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao atualizar usuário.')
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isPending && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:hover:bg-green-950"
            disabled={update.isPending}
            onClick={() => handleAction({ status: 'approved' }, 'Usuário aprovado.')}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:hover:bg-red-950"
            disabled={update.isPending}
            onClick={() => handleAction({ status: 'rejected' }, 'Usuário rejeitado.')}
          >
            <XCircle className="h-3.5 w-3.5" />
            Rejeitar
          </Button>
        </>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Mais opções</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isPending && user.status !== 'approved' && (
            <DropdownMenuItem onClick={() => handleAction({ status: 'approved' }, 'Usuário aprovado.')}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Aprovar
            </DropdownMenuItem>
          )}
          {!isPending && user.status !== 'rejected' && (
            <DropdownMenuItem onClick={() => handleAction({ status: 'rejected' }, 'Usuário rejeitado.')}>
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              Rejeitar
            </DropdownMenuItem>
          )}
          {isPending && <DropdownMenuSeparator />}
          {user.is_admin ? (
            <DropdownMenuItem
              onClick={() => handleAction({ is_admin: false }, 'Admin removido.')}
              className="text-destructive focus:text-destructive"
            >
              <ShieldOff className="mr-2 h-4 w-4" />
              Remover admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleAction({ is_admin: true }, 'Usuário promovido a admin.')}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Tornar admin
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
