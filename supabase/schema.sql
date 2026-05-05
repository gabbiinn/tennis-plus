-- ===========================================================
-- TENNIS+ — Schéma de base de données Supabase
-- À exécuter dans le SQL Editor de Supabase (Settings > SQL Editor)
-- ===========================================================

-- USERS : extension de auth.users (Supabase gère l'auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  level text default 'NC',
  city text default 'Rennes',
  neighborhood text,
  latitude float,
  longitude float,
  preferred_surfaces text[] default array['hard']::text[],
  preferred_times text[] default array['evening']::text[],
  play_style text default 'régulier',
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Trigger : créer un profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CLUBS
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
  rating decimal(2, 1),
  phone text,
  website text,
  created_at timestamp with time zone default now()
);

-- BOOKINGS : réservations de courts
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
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
  player1_id uuid references public.profiles(id) on delete cascade,
  player2_id uuid references public.profiles(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete set null,
  scheduled_at timestamp with time zone,
  status text default 'proposed',
  score text,
  winner_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- TOURNAMENTS
create table public.tournaments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  club_id uuid references public.clubs(id) on delete set null,
  start_date timestamp with time zone not null,
  type text default 'amical',
  surface text,
  max_participants int default 32,
  entry_fee decimal(10, 2) default 0,
  prize_pool text,
  description text,
  created_at timestamp with time zone default now()
);

-- TOURNAMENT_REGISTRATIONS
create table public.tournament_registrations (
  id uuid default gen_random_uuid() primary key,
  tournament_id uuid references public.tournaments(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  registered_at timestamp with time zone default now(),
  unique(tournament_id, user_id)
);

-- CONVERSATIONS
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  user1_id uuid references public.profiles(id) on delete cascade,
  user2_id uuid references public.profiles(id) on delete cascade,
  last_message_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(user1_id, user2_id)
);

-- MESSAGES
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- FORUM
create table public.forum_posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  content text,
  category text,
  created_at timestamp with time zone default now()
);

create table public.forum_replies (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.forum_posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

-- ===========================================================
-- ROW LEVEL SECURITY (RLS)
-- Très important : protège les données par défaut
-- ===========================================================

alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.bookings enable row level security;
alter table public.matches enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_registrations enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_replies enable row level security;

-- PROFILES : tout le monde peut voir, mais seul soi-même peut éditer
create policy "Profiles visible par tous" on public.profiles for select using (true);
create policy "Edition de son propre profil" on public.profiles for update using (auth.uid() = id);

-- CLUBS : visibles par tous (lecture seule)
create policy "Clubs visibles par tous" on public.clubs for select using (true);

-- BOOKINGS : chacun voit/gère ses réservations
create policy "Voir ses réservations" on public.bookings for select using (auth.uid() = user_id);
create policy "Créer ses réservations" on public.bookings for insert with check (auth.uid() = user_id);
create policy "Modifier ses réservations" on public.bookings for update using (auth.uid() = user_id);

-- MATCHES : visibles par les 2 joueurs
create policy "Voir ses matchs" on public.matches for select using (auth.uid() = player1_id or auth.uid() = player2_id);
create policy "Créer un match" on public.matches for insert with check (auth.uid() = player1_id);
create policy "Modifier ses matchs" on public.matches for update using (auth.uid() = player1_id or auth.uid() = player2_id);

-- TOURNAMENTS : visibles par tous
create policy "Tournois visibles par tous" on public.tournaments for select using (true);

-- TOURNAMENT_REGISTRATIONS
create policy "Voir les inscriptions" on public.tournament_registrations for select using (true);
create policy "S'inscrire à un tournoi" on public.tournament_registrations for insert with check (auth.uid() = user_id);
create policy "Se désinscrire" on public.tournament_registrations for delete using (auth.uid() = user_id);

-- CONVERSATIONS
create policy "Voir ses conversations" on public.conversations for select using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "Créer une conversation" on public.conversations for insert with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- MESSAGES
create policy "Voir les messages de ses conversations" on public.messages for select using (
  exists(select 1 from public.conversations where id = conversation_id and (auth.uid() = user1_id or auth.uid() = user2_id))
);
create policy "Envoyer un message" on public.messages for insert with check (auth.uid() = sender_id);

-- FORUM : posts et réponses visibles par tous
create policy "Forum visible par tous" on public.forum_posts for select using (true);
create policy "Créer un post" on public.forum_posts for insert with check (auth.uid() = author_id);

create policy "Réponses visibles par tous" on public.forum_replies for select using (true);
create policy "Créer une réponse" on public.forum_replies for insert with check (auth.uid() = author_id);

-- ===========================================================
-- DONNÉES DE DÉMO (Rennes)
-- ===========================================================

insert into public.clubs (name, address, latitude, longitude, surfaces, courts_count, price_per_hour, rating, phone) values
  ('TC Cesson-Sévigné', '14 Rue du Chêne Vert, Cesson-Sévigné', 48.1226, -1.6014, array['clay', 'hard'], 6, 16.00, 4.7, '02 99 83 00 00'),
  ('Stade Rennais Tennis', 'Avenue du Général de Gaulle, Rennes', 48.1119, -1.6786, array['hard'], 5, 19.00, 4.6, '02 99 67 50 00'),
  ('TC Bréquigny', '15 Rue Vincent Auriol, Rennes', 48.0911, -1.6815, array['grass', 'hard'], 3, 14.00, 4.4, '02 99 31 50 00');

-- Tournoi de démo
insert into public.tournaments (name, start_date, type, surface, max_participants, entry_fee, description) values
  ('Open de Rennes', '2026-05-03 09:00:00', 'amical', 'clay', 32, 15.00, 'Tournoi amical sur terre battue. 2 sets gagnants, super tie-break à 6/6 dans le 3e set.');

-- ===========================================================
-- C'EST PRÊT 🎾
-- Ton beau-frère peut maintenant brancher l'app dessus.
-- ===========================================================
