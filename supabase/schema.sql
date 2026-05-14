-- ===========================================================
-- TENNIS+ — Schéma de base de données Supabase
-- À exécuter dans le SQL Editor de Supabase (Settings > SQL Editor)
-- Ce fichier reflète la structure réelle utilisée par l'application.
-- ===========================================================

-- PROFILS : table principale des joueurs (nommée en français pour cohérence avec l'app)
create table public.profils (
  id uuid references auth.users on delete cascade primary key,
  nom text,
  serie text default 'NC',
  sexe text,
  club text,
  secteurs text[] default array[]::text[],
  dispos text[] default array[]::text[],
  annees_tennis text,
  created_at timestamp with time zone default now()
);

-- Trigger : créer un profil vide automatiquement à l'inscription
-- L'onboarding complétera le profil avec les vraies infos du joueur.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profils (id, nom)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CLUBS : terrains de tennis (municipaux et clubs privés)
create table public.clubs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text,
  city text default 'Rennes',
  latitude float,
  longitude float,
  surfaces text[],
  courts_count int default 1,
  price_per_hour decimal(10, 2),
  type text default 'club',       -- 'club' ou 'municipal'
  adherents boolean default true, -- réservé aux adhérents ?
  creneaux text[],                -- créneaux disponibles (ex: ['09:00', '10:30'])
  rating decimal(2, 1),
  phone text,
  website text,
  created_at timestamp with time zone default now()
);

-- BOOKINGS : réservations de courts
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profils(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete cascade,
  court_number int,
  start_time timestamp with time zone not null,
  duration_minutes int default 60,
  status text default 'confirmed',
  created_at timestamp with time zone default now()
);

-- MATCHES : matchs entre joueurs
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  player1_id uuid references public.profils(id) on delete cascade,
  player2_id uuid references public.profils(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete set null,
  scheduled_at timestamp with time zone,
  status text default 'proposed',
  score text,
  winner_id uuid references public.profils(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- TOURNAMENTS : tournois amicaux
create table public.tournaments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  club_id uuid references public.clubs(id) on delete set null,
  start_date timestamp with time zone not null,
  type text default 'amical',
  surface text,
  niveau text[],                  -- niveaux FFT acceptés (ex: ['15/1', '15/2'])
  max_participants int default 32,
  entry_fee decimal(10, 2) default 0,
  prize_pool text,
  description text,
  statut text default 'ouvert',   -- 'ouvert', 'complet', 'termine'
  created_at timestamp with time zone default now()
);

-- TOURNAMENT_REGISTRATIONS : inscriptions aux tournois
create table public.tournament_registrations (
  id uuid default gen_random_uuid() primary key,
  tournament_id uuid references public.tournaments(id) on delete cascade,
  user_id uuid references public.profils(id) on delete cascade,
  registered_at timestamp with time zone default now(),
  unique(tournament_id, user_id)
);

-- MESSAGES : messagerie directe entre joueurs (structure plate)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  expediteur_id uuid references public.profils(id) on delete cascade,
  destinataire_id uuid references public.profils(id) on delete cascade,
  contenu text not null,
  lu boolean default false,
  created_at timestamp with time zone default now()
);

-- FORUM
create table public.forum_posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profils(id) on delete cascade,
  title text not null,
  content text,
  category text,
  created_at timestamp with time zone default now()
);

create table public.forum_replies (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.forum_posts(id) on delete cascade,
  author_id uuid references public.profils(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

-- ===========================================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================================

alter table public.profils enable row level security;
alter table public.clubs enable row level security;
alter table public.bookings enable row level security;
alter table public.matches enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_registrations enable row level security;
alter table public.messages enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_replies enable row level security;

-- PROFILS
create policy "Profils visibles par tous" on public.profils for select using (true);
create policy "Insertion de son profil" on public.profils for insert with check (auth.uid() = id);
create policy "Edition de son propre profil" on public.profils for update using (auth.uid() = id);

-- CLUBS : lecture seule pour tous
create policy "Clubs visibles par tous" on public.clubs for select using (true);

-- BOOKINGS
create policy "Voir ses réservations" on public.bookings for select using (auth.uid() = user_id);
create policy "Créer ses réservations" on public.bookings for insert with check (auth.uid() = user_id);
create policy "Modifier ses réservations" on public.bookings for update using (auth.uid() = user_id);

-- MATCHES
create policy "Voir ses matchs" on public.matches for select using (auth.uid() = player1_id or auth.uid() = player2_id);
create policy "Créer un match" on public.matches for insert with check (auth.uid() = player1_id);
create policy "Modifier ses matchs" on public.matches for update using (auth.uid() = player1_id or auth.uid() = player2_id);

-- TOURNAMENTS : visibles par tous
create policy "Tournois visibles par tous" on public.tournaments for select using (true);

-- TOURNAMENT_REGISTRATIONS
create policy "Voir les inscriptions" on public.tournament_registrations for select using (true);
create policy "S'inscrire à un tournoi" on public.tournament_registrations for insert with check (auth.uid() = user_id);
create policy "Se désinscrire" on public.tournament_registrations for delete using (auth.uid() = user_id);

-- MESSAGES
create policy "Voir ses messages" on public.messages for select using (
  auth.uid() = expediteur_id or auth.uid() = destinataire_id
);
create policy "Envoyer un message" on public.messages for insert with check (auth.uid() = expediteur_id);

-- FORUM
create policy "Forum visible par tous" on public.forum_posts for select using (true);
create policy "Créer un post" on public.forum_posts for insert with check (auth.uid() = author_id);
create policy "Réponses visibles par tous" on public.forum_replies for select using (true);
create policy "Créer une réponse" on public.forum_replies for insert with check (auth.uid() = author_id);

-- ===========================================================
-- DONNÉES DE DÉMO (Rennes)
-- ===========================================================

insert into public.clubs (name, address, city, latitude, longitude, surfaces, courts_count, price_per_hour, type, adherents, creneaux, rating, phone) values
  ('TC Cesson-Sévigné',   '14 Rue du Chêne Vert, Cesson-Sévigné', 'Cesson-Sévigné', 48.1226, -1.6014, array['clay','hard'],   6, 16.00, 'club',      true,  array['09:00','10:30','14:00','16:00','17:30','19:00'], 4.7, '02 99 83 00 00'),
  ('Stade Rennais Tennis', 'Avenue du Général de Gaulle, Rennes',   'Rennes',         48.1119, -1.6786, array['hard'],           5, 19.00, 'club',      true,  array['08:00','09:30','11:00','14:30','17:00','18:30'], 4.6, '02 99 67 50 00'),
  ('TC Bréquigny',         '15 Rue Vincent Auriol, Rennes',         'Rennes',         48.0911, -1.6815, array['grass','hard'],   3, 14.00, 'club',      false, array['10:00','13:00','15:30','17:00','18:30'],         4.4, '02 99 31 50 00'),
  ('Courts Thabor',        'Parc du Thabor, Rennes',                'Rennes',         48.1136, -1.6627, array['hard'],           4, 0,     'municipal', false, array['Libre accès'],                                  null, null),
  ('Courts Gayeulles',     'Parc des Gayeulles, Rennes',            'Rennes',         48.1248, -1.6402, array['hard'],           6, 0,     'municipal', false, array['Libre accès'],                                  null, null);

-- Tournoi de démo
insert into public.tournaments (name, start_date, type, surface, niveau, max_participants, entry_fee, description, statut) values
  ('Open Amical Thabor',   '2026-05-24 09:00:00+02', 'amical', 'hard',  array['15/1','15/2','15/3'], 16, 0,    'Tournoi sur courts durs. 2 sets gagnants, super tie-break.', 'ouvert'),
  ('Tournoi du Printemps', '2026-06-07 09:00:00+02', 'amical', 'clay',  array['30','15/3','15/2'],   16, 5,    'Sur terre battue. Ouvert aux classés 30 et plus.', 'ouvert'),
  ('Cup Gayeulles Été',    '2026-07-12 09:00:00+02', 'amical', 'hard',  null,                        32, 0,    'Tournoi estival tous niveaux aux courts Gayeulles.', 'ouvert');

-- ===========================================================
-- C'EST PRÊT 🎾
-- ===========================================================
