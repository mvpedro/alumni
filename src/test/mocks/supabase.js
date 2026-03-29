/**
 * Supabase mock for tests.
 *
 * Usage in a test file:
 *   vi.mock('@/lib/supabase', () => import('../mocks/supabase.js'))
 *
 * Then in each test set the return value:
 *   mockSupabaseQuery({ data: [...], error: null, count: 5 })
 */

import { vi } from 'vitest'

// ── Shared mock return state ──────────────────────────────────────────────────

let _queryResult = { data: null, error: null, count: null }
let _singleResult = { data: null, error: null }
let _maybeSingleResult = { data: null, error: null }

/**
 * Set the value returned by the next awaited query builder chain.
 * Covers `.select()`, `.eq()`, `.or()`, `.ilike()`, `.range()`, `.order()`,
 * `.not()`, `.insert()`, `.update()`, `.delete()` — anything that resolves
 * via `then`.
 */
export function mockSupabaseQuery(result) {
  _queryResult = { data: null, error: null, count: null, ...result }
  _singleResult = { data: result.data ?? null, error: result.error ?? null }
  _maybeSingleResult = { data: result.data ?? null, error: result.error ?? null }
}

// ── Query builder factory ─────────────────────────────────────────────────────

function makeBuilder() {
  // A builder method always returns `this` so chains work.
  // It is also thenable so `await builder` and `const { data } = await builder`
  // resolve to `_queryResult`.
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve(_singleResult)),
    maybeSingle: vi.fn().mockImplementation(() => Promise.resolve(_maybeSingleResult)),
    // Make the builder itself awaitable
    then(resolve, reject) {
      return Promise.resolve(_queryResult).then(resolve, reject)
    },
  }
  return builder
}

// ── Storage mock ──────────────────────────────────────────────────────────────

const storageBucketMock = {
  upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
  getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.png' } }),
  remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
}

const storageMock = {
  from: vi.fn().mockReturnValue(storageBucketMock),
}

// ── Auth mock ─────────────────────────────────────────────────────────────────

// Default: no session
let _session = null
let _authStateCallback = null

export function mockAuthSession(session) {
  _session = session
  // If a listener was already registered, fire it now
  if (_authStateCallback) {
    _authStateCallback('SIGNED_IN', session)
  }
}

export function clearAuthSession() {
  _session = null
  if (_authStateCallback) {
    _authStateCallback('SIGNED_OUT', null)
  }
}

const authMock = {
  getSession: vi.fn().mockImplementation(() =>
    Promise.resolve({ data: { session: _session }, error: null })
  ),
  getUser: vi.fn().mockImplementation(() =>
    Promise.resolve({ data: { user: _session?.user ?? null }, error: null })
  ),
  signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: null }),
  signUp: vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  onAuthStateChange: vi.fn().mockImplementation((callback) => {
    _authStateCallback = callback
    // Return the Supabase-style subscription object
    return {
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    }
  }),
}

// ── Supabase client mock ──────────────────────────────────────────────────────

export const supabase = {
  from: vi.fn().mockImplementation(() => makeBuilder()),
  auth: authMock,
  storage: storageMock,
}

// Named default export so `vi.mock('@/lib/supabase', () => import(...))` works
export default { supabase }
