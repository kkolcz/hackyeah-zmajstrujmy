'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createInitiativeAction, joinInitiativeAction, updateInitiativeAction } from '@/app/actions/initiatives'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Leaf, Users, BookOpen, Loader2, MapPin, Printer, Check, ArrowRight } from 'lucide-react'
import QRCode from 'react-qr-code'

// Dynamic import for Leaflet map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-zinc-900 animate-pulse rounded-2xl flex items-center justify-center text-zinc-500">Ładowanie mapy...</div> 
})

export default function Home() {
  const { currentUser } = useAuth()
  const [ideaText, setIdeaText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initiatives, setInitiatives] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null)

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({msg, type})
    setTimeout(() => setToast(null), 4000)
  }

  const fetchInitiatives = async () => {
    const { data } = await supabase
      .from('initiatives')
      .select(`*, participants (*)`)
      .order('created_at', { ascending: false })

    if (data) setInitiatives(data)
    setIsLoadingData(false)
  }

  useEffect(() => { fetchInitiatives() }, [])

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ideaText.trim()) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('idea', ideaText)
      await createInitiativeAction(formData, currentUser.id)
      setIdeaText('')
      await fetchInitiatives()
      showToast('Zgłoszenie pomyślnie przeanalizowane. Zapisano jako szkic.')
    } catch (error) {
      showToast('Wystąpił błąd komunikacji z modelem językowym.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async (initiativeId: string) => {
    try {
      await updateInitiativeAction(initiativeId, { status: 'published' })
      await fetchInitiatives()
      showToast('Projekt jest teraz widoczny publicznie.')
    } catch (error) {
      showToast('Błąd publikacji.', 'error')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'ekologia': return <Leaf className="w-4 h-4 text-emerald-500" />
      case 'edukacja': return <BookOpen className="w-4 h-4 text-cyan-500" />
      default: return <Users className="w-4 h-4 text-blue-500" />
    }
  }

  const sortedInitiatives = [...initiatives].sort((a, b) => {
    const aMatch = a.keywords?.some((k: string) => currentUser.interests.some((i:string) => i.toLowerCase().includes(k.toLowerCase())))
    const bMatch = b.keywords?.some((k: string) => currentUser.interests.some((i:string) => i.toLowerCase().includes(k.toLowerCase())))
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  })

  return (
    <div className="flex-1 bg-white min-h-screen border-t border-gray-200">
      
      {toast && (
        <div className={`print:hidden fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-4 border-l-4 shadow-lg flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-white border-green-700 text-green-900' : 'bg-white border-red-700 text-red-900'
        }`}>
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 print:hidden flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-80 shrink-0 flex flex-col gap-8">
          
          <div className="bg-gray-50 border border-gray-300 p-6">
            <h2 className="font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-700 uppercase tracking-wide text-sm">
              Zgłoś pomysł
            </h2>
            <p className="text-gray-600 text-xs mb-6 font-medium leading-relaxed">
              Opisz swój pomysł, a nasz asystent automatycznie przygotuje wstępny plan działania i listę potrzebnych rąk do pracy.
            </p>
            
            <form onSubmit={handleSubmitIdea} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Czego brakuje w okolicy?</label>
                <textarea 
                  rows={4}
                  className="w-full bg-white border border-gray-400 p-3 text-gray-900 focus:outline-none focus:border-blue-800 resize-none text-sm"
                  placeholder="np. Zróbmy remont placu zabaw..."
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting || !ideaText.trim()}
                className="w-full bg-blue-800 text-white hover:bg-blue-900 px-4 py-3 font-bold transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSubmitting ? 'Przygotowujemy szkic...' : 'Dodaj projekt'}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 border border-gray-300 p-6">
            <h2 className="font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-700 uppercase tracking-wide text-sm">
              Filtrowanie
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Status inicjatywy</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" className="border-gray-400 text-blue-800 focus:ring-blue-800" defaultChecked /> Szukają rąk do pracy
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" className="border-gray-400 text-blue-800 focus:ring-blue-800" defaultChecked /> Zbierają materiały
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" className="border-gray-400 text-blue-800 focus:ring-blue-800" /> W trakcie realizacji
                  </label>
                </div>
              </div>
              
              {currentUser && (
                <div className="pt-4 border-t border-gray-300">
                  <div className="text-xs font-bold text-gray-700 block mb-2">Twoje dopasowanie</div>
                  <div className="text-xs text-blue-900 bg-blue-50 p-3 border-l-4 border-blue-800">
                    Aktywne sortowanie po przypisanych zainteresowaniach ({currentUser.interests.length}).
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border border-gray-300 p-2">
            <div className="text-xs font-bold text-gray-900 uppercase px-2 py-1 mb-2">Mapa w Twojej okolicy</div>
            <div className="h-[250px] w-full bg-gray-100 relative">
              <Map initiatives={initiatives} />
            </div>
          </div>
        </aside>

        {/* Board */}
        <div className="flex-1">
          <div className="border-b-2 border-red-700 pb-2 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Tablica Inicjatyw Sąsiedzkich
            </h1>
            <p className="text-sm text-gray-600 mt-1">Liczba projektów w okolicy: {initiatives.filter(i => i.status !== 'draft').length}</p>
          </div>

          <div className="space-y-4">
            {sortedInitiatives.map(initiative => {
              const isCreator = currentUser && initiative.creator_id === currentUser.id;
              const participantsCount = initiative.participants?.length || 0;
              const maxCount = initiative.max_participants || 10;
              const isDraft = initiative.status === 'draft';
              
              return (
                <div key={initiative.id} className="relative bg-white border border-gray-300 flex flex-col hover:border-gray-400 transition-colors">
                  
                  {isDraft && <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-900 text-xs font-bold px-3 py-1 border-b border-l border-yellow-300">Szkic (tylko dla Ciebie)</div>}
                  
                  <div className="p-5 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5 text-blue-800">
                          {getCategoryIcon(initiative.category)} {initiative.category}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {initiative.city}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-blue-900 mb-2 hover:underline">
                        <Link href={`/project/${initiative.id}`}>{initiative.title}</Link>
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">{initiative.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="text-xs font-bold text-gray-500">Tagi:</span>
                      {initiative.keywords?.map((k: string) => (
                        <span key={k} className="text-xs text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5">{k}</span>
                      ))}
                    </div>

                    <div className="bg-gray-50 p-4 border border-gray-200">
                      <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                        <span>Zapotrzebowanie osobowe (Wolontariat)</span>
                        <span>{participantsCount} / {maxCount}</span>
                      </div>
                      <div className="w-full bg-gray-300 h-2">
                        <div className="bg-blue-800 h-2 transition-all duration-1000" style={{width: `${Math.min(100, (participantsCount/maxCount)*100)}%`}}></div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-gray-100 border-t border-gray-300 flex gap-4 items-center">
                    <Link href={`/project/${initiative.id}`} className="text-blue-800 text-sm font-bold hover:underline flex items-center gap-1">
                      Zobacz projekt <ArrowRight className="w-4 h-4" />
                    </Link>
                    
                    {isCreator && (
                      <>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <Link href={`/project/${initiative.id}?edit=true`} className="text-gray-700 text-sm font-bold hover:underline flex items-center gap-1">
                          Edytuj projekt
                        </Link>
                      </>
                    )}

                    {isCreator && isDraft && (
                      <>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <button onClick={() => handlePublish(initiative.id)} className="text-green-700 text-sm font-bold hover:underline flex items-center gap-1">
                          <Check className="w-4 h-4" /> Opublikuj na tablicy
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
