'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const saved = localStorage.getItem('mockUserId')
      if (saved) {
        const { data } = await supabase.from('users').select('*').eq('id', saved).single()
        if (data) {
          setCurrentUser(data)
        } else {
          localStorage.removeItem('mockUserId')
        }
      }
      setIsLoadingAuth(false)
    }
    checkUser()
  }, [])

  const setUser = (user: any | null) => {
    setCurrentUser(user)
    if (user) {
      localStorage.setItem('mockUserId', user.id)
    } else {
      localStorage.removeItem('mockUserId')
    }
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser: setUser, isLoadingAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
