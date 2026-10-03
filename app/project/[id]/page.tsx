'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { joinInitiativeAction, updateInitiativeAction } from '@/app/actions/initiatives'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Leaf, Users, BookOpen, Loader2, MapPin, Printer, Edit3, ArrowLeft, Check, UsersRound, HandHeart, Calendar } from 'lucide-react'
import QRCode from 'react-qr-code'
import dynamic from 'next/dynamic'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false, loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl" /> })
const Map = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <div className="h-full w-full bg-gray-200 animate-pulse" /> })

export default function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { currentUser } = useAuth()
  
  const [initiative, setInitiative] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null)
  
  // Edit mode
  const searchParams = useSearchParams()
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true')
  const [editForm, setEditForm] = useState<any>({})

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({msg, type})
    setTimeout(() => setToast(null), 4000)
  }

  const fetchInitiative = async () => {
    const { data } = await supabase
      .from('initiatives')
      .select(`*, participants (*, user:users(*))`)
      .eq('id', id)
      .single()

    if (data) {
      setInitiative(data)
      setEditForm(data)
    }
    setIsLoading(false)
  }

  useEffect(() => { fetchInitiative() }, [id])

  if (isLoading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500">Ładowanie projektu...</div>
  if (!initiative) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500">Nie znaleziono projektu.</div>

  const isCreator = initiative.creator_id === currentUser?.id;
  const isDraft = initiative.status === 'draft';
  const participantsCount = initiative.participants?.length || 0;
  const maxCount = initiative.max_participants || 10;
  
  // Check if current user is already in participants
  const isParticipant = initiative.participants?.some((p:any) => p.user_id === currentUser?.id)

  const handleJoin = async () => {
    if (!currentUser) {
      showToast('Musisz wybrać profil', 'error'); return;
    }
    try {
      await joinInitiativeAction(initiative.id, currentUser.id)
      await fetchInitiative()
      showToast('Dołączyłeś do inicjatywy! 🎉')
    } catch (error) {
      showToast('Już dołączyłeś lub wystąpił błąd.', 'error')
    }
  }

  const saveEdit = async () => {
    try {
      await updateInitiativeAction(initiative.id, {
        title: editForm.title,
        description: editForm.description,
        budget_needed: editForm.budget_needed,
        city: editForm.city,
        lat: editForm.lat,
        lng: editForm.lng,
        event_date: editForm.event_date || null,
        keywords: typeof editForm.keywords === 'string' ? editForm.keywords.split(',').map((k:string) => k.trim()).filter((k:string) => k) : editForm.keywords,
        suggested_skills: typeof editForm.suggested_skills === 'string' ? editForm.suggested_skills.split(',').map((s:string) => s.trim()).filter((s:string) => s) : editForm.suggested_skills,
      })
      setIsEditing(false)
      await fetchInitiative()
      showToast('Zapisano zmiany!')
    } catch (error) {
      showToast('Błąd zapisu.', 'error')
    }
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen pb-20 border-t border-gray-200">
      
      {toast && (
        <div className={`print:hidden fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-4 border-l-4 shadow-lg flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-white border-green-700 text-green-900' : 'bg-white border-red-700 text-red-900'
        }`}>
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8 print:hidden">
        
        <Link href="/" className="inline-flex items-center gap-2 text-blue-800 hover:underline mb-6 font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Powrót do tablicy
        </Link>

        <div className="bg-white border border-gray-300 relative shadow-sm">
          
          {isDraft && <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-900 text-xs uppercase font-bold tracking-widest px-4 py-2 border-b border-l border-yellow-300">Status: Twój szkic</div>}
          
          <div className="p-8 md:p-12">
            
            {/* Header / Editor */}
            {isEditing ? (
              <div className="space-y-6 mb-8 bg-gray-50 p-6 border border-gray-300">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4">Edycja projektu</h2>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tytuł projektu</label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-white border border-gray-400 p-3 text-xl font-bold text-gray-900 focus:outline-none focus:border-blue-800" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Szczegółowy opis</label>
                  <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full bg-white border border-gray-400 p-3 text-gray-900 focus:outline-none focus:border-blue-800 resize-y min-h-[150px]" />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Potrzebny budżet (PLN)</label>
                    <input type="number" value={editForm.budget_needed} onChange={e => setEditForm({...editForm, budget_needed: e.target.value})} className="w-full bg-white border border-gray-400 p-3 text-gray-900 focus:outline-none focus:border-blue-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Miejscowość</label>
                    <input type="text" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} className="w-full bg-white border border-gray-400 p-3 text-gray-900 focus:outline-none focus:border-blue-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Data wydarzenia (np. YYYY-MM-DD)</label>
                    <input type="date" value={editForm.event_date ? new Date(editForm.event_date).toISOString().split('T')[0] : ''} onChange={e => setEditForm({...editForm, event_date: e.target.value})} className="w-full bg-white border border-gray-400 p-3 text-gray-900 focus:outline-none focus:border-blue-800" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Tagi (po przecinku)</label>
                    <input type="text" value={Array.isArray(editForm.keywords) ? editForm.keywords.join(', ') : editForm.keywords} onChange={e => setEditForm({...editForm, keywords: e.target.value})} className="w-full bg-white border border-gray-400 p-3 text-gray-900 focus:outline-none focus:border-blue-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Kogo szukamy? (po przecinku)</label>
                    <input type="text" value={Array.isArray(editForm.suggested_skills) ? editForm.suggested_skills.join(', ') : editForm.suggested_skills} onChange={e => setEditForm({...editForm, suggested_skills: e.target.value})} className="w-full bg-white border border-gray-400 p-3 text-gray-900 focus:outline-none focus:border-blue-800" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Współrzędne na mapie</label>
                  <LocationPicker 
                    position={editForm.lat && editForm.lng ? [editForm.lat, editForm.lng] : null} 
                    onChange={(pos) => setEditForm({...editForm, lat: pos[0], lng: pos[1]})} 
                  />
                </div>
                <div className="flex gap-4 pt-6 border-t border-gray-300">
                  <button onClick={saveEdit} className="bg-blue-800 text-white hover:bg-blue-900 px-6 py-3 font-bold transition-colors flex items-center gap-2">
                    <Check className="w-5 h-5" /> Zapisz projekt
                  </button>
                  <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-6 py-3 font-bold transition-colors">
                    Anuluj edycję
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-12 border-b-2 border-red-700 pb-8">
                <div className="flex items-center gap-6 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-blue-900 font-bold uppercase tracking-wide">
                    <span className="w-2 h-2 bg-blue-900 rounded-full"></span>
                    {initiative.category}
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <span className="flex items-center gap-1 text-gray-600 font-medium">
                    <MapPin className="w-4 h-4 text-gray-400" /> {initiative.city}
                  </span>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <span className="flex items-center gap-1 text-gray-600 font-medium">
                    <Calendar className="w-4 h-4 text-gray-400" /> Dodano: {new Date(initiative.created_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {initiative.title}
                </h1>
                
                <div className="text-gray-800 text-base leading-relaxed mb-8 max-w-4xl text-justify">
                  {initiative.description}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-gray-500 py-1">Tagi:</span>
                  {initiative.keywords?.map((k: string) => (
                    <span key={k} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 border border-gray-300">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Project Specs */}
            {!isEditing && (
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4 pb-2 border-b border-gray-300 flex items-center gap-2">
                    <HandHeart className="w-5 h-5 text-gray-500" /> Kogo/Czego szukamy?
                  </h3>
                  <ul className="space-y-3 mb-6">
                    {initiative.suggested_skills?.map((s: string, idx: number) => (
                      <li key={idx} className="text-gray-800 flex items-start gap-2 text-sm">
                        <span className="text-red-700 font-bold mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                  {initiative.budget_needed > 0 && (
                    <div className="bg-gray-50 p-4 border border-gray-300">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Potrzebne środki na start</div>
                      <div className="text-2xl font-bold text-gray-900">{Number(initiative.budget_needed).toFixed(0)} PLN</div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4 pb-2 border-b border-gray-300 flex items-center gap-2">
                    <UsersRound className="w-5 h-5 text-gray-500" /> Zebrana ekipa ({participantsCount}/{maxCount})
                  </h3>
                  
                  <div className="w-full bg-gray-200 h-2 mb-6">
                    <div className="bg-blue-800 h-2 transition-all duration-1000" style={{width: `${Math.min(100, (participantsCount/maxCount)*100)}%`}}></div>
                  </div>

                  {participantsCount > 0 ? (
                    <div className="space-y-2">
                      {initiative.participants.map((p:any) => (
                        <div key={p.id} className="flex items-center gap-4 bg-gray-50 p-3 border border-gray-300">
                          <div className="text-xl bg-white w-10 h-10 flex items-center justify-center border border-gray-200">{p.user?.avatar_url || '👤'}</div>
                          <div>
                            <div className="font-bold text-sm text-gray-900">{p.user?.name || 'Sąsiad'}</div>
                            <div className="text-xs text-gray-600">{p.user?.role === 'citizen' ? 'Mieszkaniec' : 'Partner / Sponsor'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm bg-gray-50 p-4 border border-gray-300">Jeszcze nikt się nie zgłosił. Bądź pierwszy!</p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-8 border-t-2 border-gray-200">
              {!isDraft && !isParticipant && (
                 <button 
                   onClick={handleJoin}
                   className="bg-blue-800 text-white text-base font-bold py-3 px-8 hover:bg-blue-900 transition-colors flex items-center gap-2"
                 >
                   <Users className="w-5 h-5" /> Chcę pomóc
                 </button>
              )}
              
              {!isDraft && isParticipant && (
                <div className="bg-green-50 text-green-800 border border-green-300 text-base font-bold py-3 px-8 flex items-center gap-2">
                  <Check className="w-5 h-5" /> Udział potwierdzony
                </div>
              )}

              {isCreator && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="bg-white text-gray-900 border border-gray-400 font-bold py-3 px-8 hover:bg-gray-100 transition-colors flex items-center gap-2">
                  <Edit3 className="w-5 h-5" /> Edytuj projekt
                </button>
              )}

              {!isDraft && (
                <button 
                  onClick={() => {
                    document.body.classList.add('printing-poster');
                    const style = document.createElement('style');
                    style.id = 'print-style';
                    style.innerHTML = `
                      @media print {
                        body * { visibility: hidden; }
                        #poster-${initiative.id}, #poster-${initiative.id} * { visibility: visible; }
                        #poster-${initiative.id} {
                          position: absolute; left: 0; top: 0; width: 100%;
                        }
                      }
                    `;
                    document.head.appendChild(style);
                    window.print();
                    document.head.removeChild(style);
                    document.body.classList.remove('printing-poster');
                  }}
                  className="bg-gray-100 text-gray-800 border border-gray-300 font-bold py-3 px-8 hover:bg-gray-200 transition-colors flex items-center gap-2 ml-auto"
                >
                  <Printer className="w-5 h-5" /> Wydrukuj plakat
                </button>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Hidden Poster Element specifically for printing */}
      <div id={`poster-${initiative?.id}`} className="hidden print:flex print:flex-col print:h-screen print:w-screen print:bg-white print:text-black p-8 border-[8px] border-black overflow-hidden box-border">
         
         {/* Nagłówek */}
         <div className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 border-b-2 border-black pb-2 flex justify-between">
           <span>Obywatelska Inicjatywa Lokalna: {initiative?.city}</span>
           <span>Identyfikator: {initiative?.id.substring(0,8)}</span>
         </div>
         
         <h1 className="text-5xl font-black mb-4 leading-tight uppercase line-clamp-2">{initiative?.title}</h1>
         
         <div className="flex gap-2 mb-4">
            <div className="bg-black text-white px-3 py-1 font-bold text-lg uppercase flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Kiedy: {initiative?.event_date ? new Date(initiative.event_date).toLocaleDateString('pl-PL') : 'Termin do ustalenia'}
            </div>
            <div className="border-2 border-black text-black px-3 py-1 font-bold text-lg uppercase flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Gdzie: {initiative?.city}
            </div>
         </div>

         <p className="text-xl mb-6 text-gray-800 font-medium leading-snug line-clamp-4">{initiative?.description}</p>
         
         {/* Srodek: Mapa i Zapotrzebowanie */}
         <div className="flex-1 flex gap-6 min-h-0 mb-6">
            <div className="flex-1 border-4 border-black relative overflow-hidden bg-gray-100 flex flex-col">
              <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 text-xs font-bold z-[1000] uppercase">Dokładna lokalizacja</div>
              <div className="w-full h-full [&_.leaflet-control-zoom]:hidden">
                <Map initiatives={[initiative]} />
              </div>
            </div>
            
            <div className="w-1/3 bg-gray-100 p-4 border-4 border-black flex flex-col">
              <div className="text-lg font-bold mb-2 uppercase tracking-wide text-black border-b-2 border-black pb-2">Kogo/Czego szukamy?</div>
              <div className="text-xl font-black flex-1 line-clamp-6">{initiative?.suggested_skills?.join(', ')}</div>
              
              {initiative?.budget_needed > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-black">
                  <div className="text-xs uppercase font-bold text-gray-600">Szacowany koszt materiałów:</div>
                  <div className="text-2xl font-black">{Number(initiative?.budget_needed).toFixed(0)} PLN</div>
                </div>
              )}
            </div>
         </div>

         {/* Stopka: QR i Wezwanie */}
         <div className="flex justify-between items-center border-t-4 border-black pt-6 shrink-0">
           <div className="text-left max-w-lg">
             <h2 className="text-3xl font-black mb-2 uppercase">Dołącz do nas!</h2>
             <p className="text-lg text-gray-700 font-medium leading-tight">Zeskanuj kod QR aparatem w telefonie, aby zapisać się na wydarzenie. Poznaj sąsiadów i zróbmy razem coś dobrego!</p>
           </div>
           <div className="bg-white p-2 border-4 border-black">
             <QRCode value={`https://zmajstrujmy.pl/project/${initiative?.id}`} size={160} />
           </div>
         </div>
      </div>

    </div>
  )
}
