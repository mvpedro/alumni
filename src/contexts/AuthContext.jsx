import { createContext, useContext, useEffect, useState } from 'react'
import posthog from 'posthog-js'
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
      (_event, session) => {
        setSession(session)
        if (session) {
          fetchProfile(session.user.id)
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
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      const { data: alumniData } = profileData
        ? await supabase
            .from('alumni')
            .select('*, company:companies(id, name, logo_url)')
            .eq('profile_id', userId)
            .maybeSingle()
        : { data: null }

      setProfile(profileData)
      setAlumni(alumniData)

      // Identify user in PostHog
      if (profileData) {
        posthog.identify(userId, {
          name: alumniData?.full_name || profileData.full_name,
          email: alumniData?.contact_email,
          entry_class: alumniData?.entry_class || profileData.entry_class,
          is_admin: profileData.is_admin,
          status: profileData.status,
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setProfile(null)
      setAlumni(null)
    } finally {
      setLoading(false)
    }
  }

  async function signUp({ email, password, fullName, entryClass, userType = 'alumni', expectedGraduation }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          entry_class: entryClass,
          user_type: userType,
          ...(expectedGraduation ? { expected_graduation: expectedGraduation } : {}),
        },
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
    posthog.reset()
    setProfile(null)
    setAlumni(null)
    setSession(null)
    await supabase.auth.signOut()
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
    userType: profile?.user_type ?? 'alumni',
    isGraduando: profile?.user_type === 'graduando',
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
