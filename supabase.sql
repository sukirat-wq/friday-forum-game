-- Paanch Clue tables. Paste this whole file into Supabase → SQL Editor → New query, then click Run.
-- Safe to run more than once.

create table if not exists paanch_state (
  id int primary key,
  state jsonb not null
);

create table if not exists paanch_players (
  nick text primary key,
  seen_at bigint not null
);

create table if not exists paanch_answers (
  id bigserial primary key,
  k text not null,
  nick text not null,
  n int not null,
  g text not null,
  h int,
  t bigint not null
);
create index if not exists paanch_answers_k on paanch_answers (k);

-- Lock the tables to the server. Only the secret key (used by the Vercel site) can read or write.
-- With no policies, the public "anon" key can't see anything, so nobody can read answers from the browser.
alter table paanch_state enable row level security;
alter table paanch_players enable row level security;
alter table paanch_answers enable row level security;
