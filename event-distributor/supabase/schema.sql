-- Enable required extensions
create extension if not exists pgcrypto;

-- Events
create table if not exists "Event" (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  date timestamptz,
  time text,
  location jsonb,
  category text,
  tags text[] default '{}',
  price double precision,
  "isVirtual" boolean default false,
  images text[] default '{}',
  organizer text,
  url text,
  spontacts jsonb default '{}',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- Ensure column exists in migrated DBs
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='Event' and column_name='spontacts') then
    alter table "Event" add column spontacts jsonb default '{}';
  end if;
end $$;

create table if not exists "EventVersion" (
  id uuid primary key default gen_random_uuid(),
  "eventId" uuid not null references "Event"(id) on delete cascade,
  snapshot jsonb not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists "PlatformConfig" (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  method text not null check (method in ('api','ui')),
  name text,
  config jsonb not null default '{}',
  enabled boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "PublishJob" (
  id uuid primary key default gen_random_uuid(),
  "eventId" uuid not null references "Event"(id) on delete cascade,
  platform text not null,
  method text not null check (method in ('api','ui')),
  action text not null check (action in ('create','update','delete')),
  "scheduledAt" timestamptz not null,
  status text not null default 'scheduled',
  "tryCount" int not null default 0,
  "lastError" text,
  result jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "EventPublication" (
  id uuid primary key default gen_random_uuid(),
  "eventId" uuid not null references "Event"(id) on delete cascade,
  platform text not null,
  method text not null check (method in ('api','ui')),
  status text not null,
  "externalId" text,
  "externalUrl" text,
  "verifiedAt" timestamptz,
  details jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("eventId", platform, method)
);

create table if not exists "LogEntry" (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  level text not null,
  message text not null,
  meta jsonb,
  "createdAt" timestamptz not null default now()
);

-- updatedAt trigger
create or replace function set_updated_at() returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_event_updated before update on "Event" for each row execute procedure set_updated_at();
create trigger trg_platform_updated before update on "PlatformConfig" for each row execute procedure set_updated_at();
create trigger trg_job_updated before update on "PublishJob" for each row execute procedure set_updated_at();
create trigger trg_pub_updated before update on "EventPublication" for each row execute procedure set_updated_at();
