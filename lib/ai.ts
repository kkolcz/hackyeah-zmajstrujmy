import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function parseInitiativeIdea(idea: string) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Missing GROQ_API_KEY environment variable');
  }

  const systemPrompt = `Jesteś asystentem zarządzania obywatelskimi inicjatywami. Otrzymujesz luźny pomysł mieszkańca na wydarzenie / akcję w mieście.
Celem jest integracja ludzi (np. wyciągnięcie seniorów z domów, młodych ludzi po pracy).
Zwróć WYŁĄCZNIE obiekt JSON w formacie:
{
  "title": "Chwytliwy, ciepły tytuł inicjatywy",
  "description": "Zwięzły, motywujący opis zachęcający różne grupy wiekowe do udziału",
  "category": "Ekologia | Infrastruktura | Integracja | Edukacja",
  "city": "Miasto (wywnioskuj lub daj np. Kraków)",
  "budget_needed": 50.00, // Koszt materiałów, 0 jeśli darmowe
  "keywords": ["tag1", "tag2", "tag3"], // 3-4 słowa kluczowe
  "suggested_skills": ["Młotek", "Chęci do rozmowy", "Wypieki"], // Luźne sugestie co się przyda
  "max_participants": 10 // Ilu ludzi optymalnie (liczba)
}`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: idea },
    ],
    model: 'openai/gpt-oss-120b',
    response_format: { type: 'json_object' },
  });

  const responseContent = completion.choices[0]?.message?.content;
  
  if (!responseContent) throw new Error('Brak odpowiedzi od modelu AI');

  try {
    return JSON.parse(responseContent);
  } catch (e) {
    throw new Error('Odpowiedź AI nie jest poprawnym formatem JSON');
  }
}
