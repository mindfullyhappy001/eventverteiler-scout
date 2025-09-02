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
  action text not null check (action in ('create','update','delete','discover')),
  "scheduledAt" timestamptz not null,
  status text not null default 'scheduled',
  "tryCount" int not null default 0,
  "lastError" text,
  result jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- Ensure PublishJob.action allows 'discover' on existing DBs
DO $$
DECLARE con RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PublishJob' AND column_name='action') THEN
    FOR con IN
      SELECT conname FROM pg_constraint 
      WHERE conrelid='"PublishJob"'::regclass AND contype='c' AND pg_get_constraintdef(oid) ILIKE '%action%'
    LOOP
      EXECUTE 'ALTER TABLE "PublishJob" DROP CONSTRAINT ' || quote_ident(con.conname);
    END LOOP;
    -- Re-add unified constraint
    BEGIN
      ALTER TABLE "PublishJob" ADD CONSTRAINT publishjob_action_check CHECK (action in (''create'',''update'',''delete'',''discover''));
    EXCEPTION WHEN duplicate_object THEN
      -- ignore if already present
      NULL;
    END;
  END IF;
END $$;

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

-- Cache of field options per platform/field/method
create table if not exists "FieldOption" (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  method text, -- 'api' | 'ui' optional
  field text not null,
  options jsonb not null default '[]',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique (platform, method, field)
);

-- updatedAt trigger function
create or replace function set_updated_at() returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

-- Idempotent triggers
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='Event') THEN
    DROP TRIGGER IF EXISTS trg_event_updated ON "Event";
    CREATE TRIGGER trg_event_updated BEFORE UPDATE ON "Event" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='PlatformConfig') THEN
    DROP TRIGGER IF EXISTS trg_platform_updated ON "PlatformConfig";
    CREATE TRIGGER trg_platform_updated BEFORE UPDATE ON "PlatformConfig" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='PublishJob') THEN
    DROP TRIGGER IF EXISTS trg_job_updated ON "PublishJob";
    CREATE TRIGGER trg_job_updated BEFORE UPDATE ON "PublishJob" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='EventPublication') THEN
    DROP TRIGGER IF EXISTS trg_pub_updated ON "EventPublication";
    CREATE TRIGGER trg_pub_updated BEFORE UPDATE ON "EventPublication" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='FieldOption') THEN
    DROP TRIGGER IF EXISTS trg_fieldopt_updated ON "FieldOption";
    CREATE TRIGGER trg_fieldopt_updated BEFORE UPDATE ON "FieldOption" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;