'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Building2, Sparkles, ArrowRight, UserCircle } from 'lucide-react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, setCurrentUser, isLoadingAuth } = useAuth()
  
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [usersDb, setUsersDb] = useState<any[]>([])
  
  // Registration form
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('👋')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'login') {
      supabase.from('users').select('*').order('name').then(({ data }) => {
        if (data) setUsersDb(data)
      })
    }
  }, [mode])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const parsedInterests = interests.split(',').map(s => s.trim()).filter(Boolean)
    
    const { data, error } = await supabase.from('users').insert({
      name,
      avatar_url: avatar,
      bio,
      interests: parsedInterests,
      role: 'citizen'
    }).select().single()

    setIsSubmitting(false)
    if (data) setCurrentUser(data)
  }

  const handleLogin = (user: any) => {
    setCurrentUser(user)
  }

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Ładowanie...</div>
  }

  if (currentUser) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white shadow-md border-t-4 border-red-700">
        
        <div className="p-8 border-b border-gray-200 flex items-center gap-4 bg-gray-50">
          <Building2 className="w-12 h-12 text-red-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Zmajstrujmy – Panel Logowania</h1>
            <p className="text-gray-600 text-sm">Dołącz do lokalnej społeczności działaczy</p>
          </div>
        </div>

        <div className="p-8">
          
          <div className="flex border-b border-gray-300 mb-8">
            <button 
              onClick={() => setMode('register')}
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 -mb-[1px] ${mode === 'register' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Załóż darmowe konto
            </button>
            <button 
              onClick={() => setMode('login')}
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 -mb-[1px] ${mode === 'login' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Zaloguj się
            </button>
          </div>

          {mode === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-800 p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>Wskazówka:</strong> Wypełnienie profilu pomaga nam lepiej dopasować inicjatywy, które mogą Cię zainteresować.
                </p>
              </div>

              <div className="flex gap-4">
                <div className="w-1/4">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Avatar</label>
                  <input type="text" maxLength={2} value={avatar} onChange={e => setAvatar(e.target.value)} className="w-full bg-white border border-gray-400 p-3 text-xl text-center text-gray-900 focus:outline-none focus:border-blue-800" required />
                </div>
                <div className="w-3/4">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Imię i nazwisko</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border border-gray-400 p-3 text-gray-900 focus:outline-none focus:border-blue-800" placeholder="np. Jan Kowalski" required />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Kilka słów o Tobie (Opcjonalnie)</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-white border border-gray-400 p-3 text-gray-900 focus:outline-none focus:border-blue-800 resize-none h-20" placeholder="Zwięzły opis kompetencji lub tego co lubisz robić." required />
              </div>
              
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Twoje zainteresowania</label>
                <p className="text-xs text-gray-500 mb-2">Wpisz po przecinku, np. Zieleń, Majsterkowanie, Zwierzęta.</p>
                <input type="text" value={interests} onChange={e => setInterests(e.target.value)} className="w-full bg-white border border-gray-400 p-3 text-gray-900 focus:outline-none focus:border-blue-800" required />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-800 text-white hover:bg-blue-900 px-8 py-3 font-bold transition-colors disabled:opacity-50 w-full md:w-auto"
                >
                  {isSubmitting ? 'Przetwarzanie...' : 'Zarejestruj konto'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-700 mb-4">Wybierz profil do przetestowania (Demo Hackathon):</p>
              <div className="max-h-[300px] overflow-y-auto border border-gray-300">
                {usersDb.length === 0 && <p className="text-center text-gray-500 text-sm py-8">Brak kont w systemie. Załóż nowe.</p>}
                {usersDb.map((u, i) => (
                  <button 
                    key={u.id}
                    onClick={() => handleLogin(u)}
                    className={`w-full text-left p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${i !== usersDb.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <div className="text-2xl">{u.avatar_url || '👤'}</div>
                    <div className="flex-1">
                      <div className="font-bold text-blue-800">{u.name}</div>
                      <div className="text-xs text-gray-500 mt-1">Interesuje się: {u.interests?.join(', ')}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
