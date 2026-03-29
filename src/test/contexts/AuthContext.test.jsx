import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import {
  mockSupabaseQuery,
  mockAuthSession,
  clearAuthSession,
} from '../mocks/supabase.js'

// ── Mock Supabase ─────────────────────────────────────────────────────────────
vi.mock('@/lib/supabase', async () => {
  const mod = await import('../mocks/supabase.js')
  return { supabase: mod.supabase }
})

// ── Mock PostHog (not under test) ─────────────────────────────────────────────
vi.mock('posthog-js', () => ({
  default: { identify: vi.fn(), reset: vi.fn() },
}))

// ── Helper component that exposes context values ──────────────────────────────
function AuthConsumer() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="isAdmin">{String(auth.isAdmin)}</span>
      <span data-testid="isApproved">{String(auth.isApproved)}</span>
      <span data-testid="isGraduando">{String(auth.isGraduando)}</span>
      <span data-testid="userType">{auth.userType}</span>
      <span data-testid="userId">{auth.user?.id ?? 'none'}</span>
    </div>
  )
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAuthSession()
    mockSupabaseQuery({ data: null, error: null })
  })

  it('initializes with loading=true, then resolves to unauthenticated', async () => {
    renderWithAuth()
    // loading starts true (synchronously rendered as string "true")
    expect(screen.getByTestId('loading').textContent).toBe('true')

    // After the async getSession resolves, loading becomes false
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
  })

  it('sets isAuthenticated=true when a session exists', async () => {
    mockAuthSession({
      user: { id: 'user-1', email: 'test@example.com' },
    })
    // Profile and alumni queries return null (no profile yet)
    mockSupabaseQuery({ data: null, error: null })

    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
    expect(screen.getByTestId('authenticated').textContent).toBe('true')
    expect(screen.getByTestId('userId').textContent).toBe('user-1')
  })

  it('sets isAdmin=true for admin profiles', async () => {
    const session = { user: { id: 'admin-1', email: 'admin@example.com' } }
    mockAuthSession(session)
    mockSupabaseQuery({ data: { id: 'admin-1', is_admin: true, status: 'approved', user_type: 'alumni' }, error: null })

    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('isAdmin').textContent).toBe('true')
    })
    expect(screen.getByTestId('isApproved').textContent).toBe('true')
  })

  it('sets isApproved=false for pending profiles', async () => {
    const session = { user: { id: 'user-2', email: 'pending@example.com' } }
    mockAuthSession(session)
    mockSupabaseQuery({ data: { id: 'user-2', is_admin: false, status: 'pending', user_type: 'alumni' }, error: null })

    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('isApproved').textContent).toBe('false')
    })
    expect(screen.getByTestId('isAdmin').textContent).toBe('false')
  })

  it('sets isGraduando=true and userType=graduando for graduando profiles', async () => {
    const session = { user: { id: 'grad-1', email: 'grad@example.com' } }
    mockAuthSession(session)
    mockSupabaseQuery({ data: { id: 'grad-1', is_admin: false, status: 'approved', user_type: 'graduando' }, error: null })

    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('isGraduando').textContent).toBe('true')
    })
    expect(screen.getByTestId('userType').textContent).toBe('graduando')
  })

  it('clears state after signOut', async () => {
    const session = { user: { id: 'user-3', email: 'user@example.com' } }
    mockAuthSession(session)
    mockSupabaseQuery({ data: { id: 'user-3', is_admin: false, status: 'approved', user_type: 'alumni' }, error: null })

    let authCtx
    function Capture() {
      authCtx = useAuth()
      return null
    }

    render(
      <AuthProvider>
        <Capture />
      </AuthProvider>
    )

    await waitFor(() => expect(authCtx.loading).toBe(false))
    expect(authCtx.isAuthenticated).toBe(true)

    await act(async () => {
      clearAuthSession()
      await authCtx.signOut()
    })

    expect(authCtx.isAuthenticated).toBe(false)
    expect(authCtx.profile).toBeNull()
  })
})
