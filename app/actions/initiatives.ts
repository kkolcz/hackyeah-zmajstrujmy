'use server'

import { supabase } from '@/lib/supabase'
import { parseInitiativeIdea } from '@/lib/ai'
import { revalidatePath } from 'next/cache'

export async function createInitiativeAction(formData: FormData, userId: string) {
  const idea = formData.get('idea') as string
  if (!idea || !userId) throw new Error('Brak pomysłu lub użytkownika')

  const parsed = await parseInitiativeIdea(idea)
  
  const { data: initiative, error } = await supabase
    .from('initiatives')
    .insert({
      creator_id: userId,
      title: parsed.title,
      description: parsed.description,
      category: parsed.category,
      budget_needed: parsed.budget_needed || 0,
      city: parsed.city || 'Nieokreślone',
      lat: parsed.lat || null,
      lng: parsed.lng || null,
      keywords: parsed.keywords || [],
      suggested_skills: parsed.suggested_skills || [],
      max_participants: parsed.max_participants || 10,
      status: 'draft' // Twórca może edytować
    })
    .select()
    .single()

  if (error || !initiative) {
    console.error(error)
    throw new Error('Błąd przy zapisie inicjatywy')
  }

  revalidatePath('/')
  return initiative
}

export async function joinInitiativeAction(initiativeId: string, userId: string) {
  const { error } = await supabase
    .from('participants')
    .insert({ initiative_id: initiativeId, user_id: userId })

  if (error) throw new Error('Już dołączyłeś lub wystąpił błąd')
  revalidatePath('/')
}

export async function leaveInitiativeAction(initiativeId: string, userId: string) {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('initiative_id', initiativeId)
    .eq('user_id', userId)

  if (error) throw new Error('Nie udało się wycofać udziału')
  revalidatePath('/')
}

export async function updateInitiativeAction(initiativeId: string, updates: any) {
  const { error } = await supabase
    .from('initiatives')
    .update(updates)
    .eq('id', initiativeId)

  if (error) throw new Error('Błąd przy edycji')
  revalidatePath('/')
}
