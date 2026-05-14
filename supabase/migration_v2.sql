-- ===========================================================
-- TENNIS+ — Migration v2
-- À appliquer si tu as déjà exécuté le schema.sql initial.
-- Ajoute les colonnes manquantes sur les tables existantes.
-- ===========================================================

-- 1. Si ta table s'appelle "profiles" (anglais) → la renommer en "profils"
-- ATTENTION : décommente seulement si nécessaire
-- alter table public.profiles rename to profils;

-- 2. Si ta table profils n'a pas les bonnes colonnes, les ajouter :
alter table public.profils
  add column if not exists nom text,
  add column if not exists serie text default 'NC',
  add column if not exists sexe text,
  add column if not exists club text,
  add column if not exists secteurs text[] default array[]::text[],
  add column if not exists dispos text[] default array[]::text[],
  add column if not exists annees_tennis text;

-- 3. Ajouter les colonnes manquantes sur clubs :
alter table public.clubs
  add column if not exists type text default 'club',
  add column if not exists adherents boolean default true,
  add column if not exists creneaux text[];

-- Mettre à jour les clubs de démo si besoin
update public.clubs set
  type = 'municipal', adherents = false, creneaux = array['Libre accès']
where price_per_hour = 0 or price_per_hour is null;

update public.clubs set
  type = 'club', creneaux = array['09:00','10:30','14:00','16:00','18:00','19:00']
where type is null or type = 'club';

-- 4. Ajouter les colonnes manquantes sur tournaments :
alter table public.tournaments
  add column if not exists niveau text[],
  add column if not exists statut text default 'ouvert';

-- 5. Si ta table messages utilise l'ancien schéma (conversation_id, sender_id, content)
-- → La recréer avec la structure plate :
-- (à n'exécuter que si la table est vide ou si tu veux repartir de zéro)
--
-- drop table if exists public.messages cascade;
-- create table public.messages (
--   id uuid default gen_random_uuid() primary key,
--   expediteur_id uuid references public.profils(id) on delete cascade,
--   destinataire_id uuid references public.profils(id) on delete cascade,
--   contenu text not null,
--   lu boolean default false,
--   created_at timestamp with time zone default now()
-- );
-- alter table public.messages enable row level security;
-- create policy "Voir ses messages" on public.messages for select using (
--   auth.uid() = expediteur_id or auth.uid() = destinataire_id
-- );
-- create policy "Envoyer un message" on public.messages for insert with check (auth.uid() = expediteur_id);

-- 6. Politique insert manquante sur profils (si pas déjà présente) :
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profils' and policyname = 'Insertion de son profil'
  ) then
    execute 'create policy "Insertion de son profil" on public.profils for insert with check (auth.uid() = id)';
  end if;
end $$;

-- ===========================================================
-- FIN DE LA MIGRATION
-- ===========================================================
