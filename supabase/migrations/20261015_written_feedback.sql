-- Add optional written feedback without changing existing ratings.
alter table public.ratings
  add column if not exists comment text not null default ''
  check (char_length(comment) <= 1000);
