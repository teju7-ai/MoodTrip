-- MoodTrip database setup.
-- Run in a new Supabase project's SQL Editor.

create table if not exists public.itineraries (
  id uuid primary key,
  destination text not null,
  mood text not null check (
    mood in (
      'relaxing',
      'adventurous',
      'cultural',
      'foodie',
      'nightlife'
    )
  ),
  plan jsonb not null check (
    jsonb_typeof(plan) = 'object'
  ),
  feedback_token_hash text not null,
  share_token uuid unique,
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  itinerary_id uuid primary key
    references public.itineraries(id)
    on delete cascade,
  rating smallint not null check (
    rating between 1 and 5
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.itineraries enable row level security;
alter table public.ratings enable row level security;

revoke all on table public.itineraries, public.ratings
  from anon, authenticated;

grant usage on schema public to service_role;

grant select, insert, update
  on table public.itineraries, public.ratings
  to service_role;