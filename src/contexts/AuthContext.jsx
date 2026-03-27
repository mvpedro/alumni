import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [alumni, setAlumni] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setAlumni(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    let alumniData = null
    if (profileData) {
      const { data } = await supabase
        .from('alumni')
        .select('*, company:companies(id, name, logo_url)')
        .eq('profile_id', userId)
        .single()
      alumniData = data
    }

    setProfile(profileData)
    setAlumni(alumniData)
    setLoading(false)
  }

  async function signUp({ email, password, fullName, entryClass }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, entry_class: entryClass },
      },
    })
    return { data, error }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }

  async function refreshProfile() {
    if (session) await fetchProfile(session.user.id)
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    alumni,
    loading,
    isAuthenticated: !!session,
    isApproved: profile?.status === 'approved',
    isAdmin: profile?.is_admin === true,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
