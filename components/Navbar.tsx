'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Building2, User, X } from 'lucide-react'
import Link from 'next/link'

export default function Navbar() {
  const { currentUser, setCurrentUser } = useAuth()
  const [profileModal, setProfileModal] = useState<any>(null)

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState<any>({})

  const handleOpenProfile = () => {
    setProfileModal(currentUser)
    setEditForm(currentUser)
    setIsEditingProfile(false)
  }

  const handleSaveProfile = async () => {
    const updatedUser = {
      ...currentUser,
      name: editForm.name,
      bio: editForm.bio,
      interests: typeof editForm.interests === 'string' 
        ? editForm.interests.split(',').map((s:string) => s.trim()).filter((s:string) => s)
        : editForm.interests
    }
    
    // Update db
    const { supabase } = await import('@/lib/supabase')
    await supabase.from('users').update(updatedUser).eq('id', updatedUser.id)

    setCurrentUser(updatedUser)
    setProfileModal(updatedUser)
    setIsEditingProfile(false)
  }

  return (
    <>
      {profileModal && (
        <div className="print:hidden fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60">
          <div className="bg-white border-t-4 border-red-700 p-6 max-w-md w-full relative shadow-lg">
            <button onClick={() => setProfileModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">Twój profil</h2>
            
            {isEditingProfile ? (
              <div className="space-y-4 mb-6 mt-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Imię i nazwisko</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-white border border-gray-400 p-2 text-sm text-gray-900 focus:outline-none focus:border-blue-800" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Dodatkowe informacje (Bio)</label>
                  <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-white border border-gray-400 p-2 text-sm text-gray-900 focus:outline-none focus:border-blue-800 resize-none h-20" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Zainteresowania (oddzielone przecinkiem)</label>
                  <input type="text" value={Array.isArray(editForm.interests) ? editForm.interests.join(', ') : editForm.interests} onChange={e => setEditForm({...editForm, interests: e.target.value})} className="w-full bg-white border border-gray-400 p-2 text-sm text-gray-900 focus:outline-none focus:border-blue-800" />
                </div>
                <div className="flex gap-2 pt-4">
                  <button onClick={handleSaveProfile} className="bg-blue-800 text-white font-bold py-2 px-6 hover:bg-blue-900 transition-colors">Zapisz zmiany</button>
                  <button onClick={() => setIsEditingProfile(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 hover:bg-gray-300 transition-colors">Anuluj</button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <div className="mb-4">
                  <span className="text-sm text-gray-500 block">Twoje dane:</span>
                  <span className="text-lg font-bold text-gray-900">{profileModal.name}</span>
                </div>
                <div className="mb-4">
                  <span className="text-sm text-gray-500 block">Informacje:</span>
                  <span className="text-sm text-gray-900">{profileModal.bio}</span>
                </div>
                <div className="mb-6">
                  <span className="text-sm text-gray-500 block mb-1">Wybrane zainteresowania:</span>
                  <div className="flex flex-wrap gap-1">
                    {profileModal.interests.map((i: string) => (
                      <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-800 border border-gray-300">{i}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <button onClick={() => setIsEditingProfile(true)} className="bg-white text-blue-800 font-bold py-2 px-4 border border-blue-800 hover:bg-blue-50 transition-colors">
                    Edytuj profil
                  </button>
                  <button onClick={() => setProfileModal(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 hover:bg-gray-300 transition-colors">
                    Zamknij
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="print:hidden w-full bg-white border-b-4 border-red-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <Building2 className="w-8 h-8 text-red-700" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900 leading-tight">Zmajstrujmy</span>
              <span className="text-sm text-gray-500 font-medium leading-tight">Platforma wspólnego działania</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            <button 
              className="flex items-center gap-2 hover:bg-gray-100 p-2 transition-colors border border-transparent hover:border-gray-200" 
              onClick={handleOpenProfile}
              title="Zobacz profil"
            >
              <User className="w-5 h-5 text-blue-900" />
              <span className="text-sm font-bold text-blue-900 hidden md:block">Moje konto</span>
            </button>
            <div className="w-px h-8 bg-gray-300"></div>
            <button 
              onClick={() => setCurrentUser(null)}
              className="text-gray-600 text-sm font-bold hover:text-black transition-colors"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
