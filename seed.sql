-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop tables if they exist to allow re-seeding
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS vacancies; -- old table
DROP TABLE IF EXISTS initiatives;
DROP TABLE IF EXISTS users;

-- 1. Create tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  interests TEXT[] DEFAULT '{}',
  city TEXT,
  role TEXT DEFAULT 'citizen'
);

CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  budget_needed DECIMAL(10,2) DEFAULT 0,
  category TEXT,
  city TEXT,
  keywords TEXT[] DEFAULT '{}',
  suggested_skills TEXT[] DEFAULT '{}',
  max_participants INTEGER DEFAULT 10,
  status TEXT DEFAULT 'published', -- 'draft' | 'published'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(initiative_id, user_id)
);

-- 2. Insert Users
INSERT INTO users (id, name, interests, city, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Tomek', ARRAY['Programowanie', 'IoT', 'Elektronika'], 'Kraków', 'citizen'),
  ('22222222-2222-2222-2222-222222222222', 'Zofia', ARRAY['Ogrodnictwo', 'Kwiaty', 'Spacer'], 'Kraków', 'citizen'),
  ('33333333-3333-3333-3333-333333333333', 'Krzysztof', ARRAY['Stolarstwo', 'Narzędzia'], 'Warszawa', 'citizen');

-- 3. Insert Initiatives
INSERT INTO initiatives (id, creator_id, title, description, budget_needed, category, city, keywords, suggested_skills, max_participants, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Wspólne sadzenie kwiatów przed blokiem', 'Szukam młodych i starszych do pomocy przy odświeżeniu klombów. Ja zapewniam wiedzę i nasiona, przydadzą się silne ręce i trochę narzędzi ogrodowych. Super okazja do spędzenia czasu na świeżym powietrzu!', 50.00, 'Ekologia', 'Kraków', ARRAY['ogrodnictwo', 'integracja międzypokoleniowa', 'zieleń'], ARRAY['Łopata', 'Chęci do pracy', 'Siła'], 5, 'published'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Budowa budek lęgowych z IoT', 'Budujemy domki dla ptaków wyposażone w małe kamerki. Projekt połączy stolarstwo z elektroniką. Każdy znajdzie coś dla siebie, nawet jeśli po prostu chce pomóc malować!', 200.00, 'Edukacja', 'Kraków', ARRAY['IoT', 'ptaki', 'technologia', 'drewno'], ARRAY['Lutowanie', 'Malowanie', 'Wkrętarka'], 10, 'published');

-- 4. Insert Participants
INSERT INTO participants (id, initiative_id, user_id) VALUES
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333');
