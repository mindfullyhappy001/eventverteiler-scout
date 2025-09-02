-- Buckets
insert into storage.buckets (id, name, public) values ('bot-sessions','bot-sessions', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('bot-artifacts','bot-artifacts', true) on conflict (id) do nothing;

-- Ensure RLS is enabled (usually already)
alter table storage.objects enable row level security;

-- Policies for bot-sessions (authenticated read/write)
drop policy if exists "bot-sessions-auth-read" on storage.objects;
create policy "bot-sessions-auth-read" on storage.objects for select using (
  bucket_id = 'bot-sessions' and auth.role() = 'authenticated'
);

drop policy if exists "bot-sessions-auth-write" on storage.objects;
create policy "bot-sessions-auth-write" on storage.objects for insert with check (
  bucket_id = 'bot-sessions' and auth.role() = 'authenticated'
);

drop policy if exists "bot-sessions-auth-update" on storage.objects;
create policy "bot-sessions-auth-update" on storage.objects for update using (
  bucket_id = 'bot-sessions' and auth.role() = 'authenticated'
);

drop policy if exists "bot-sessions-auth-delete" on storage.objects;
create policy "bot-sessions-auth-delete" on storage.objects for delete using (
  bucket_id = 'bot-sessions' and auth.role() = 'authenticated'
);

-- Policies for bot-artifacts (public read; authenticated write)
drop policy if exists "bot-artifacts-public-read" on storage.objects;
create policy "bot-artifacts-public-read" on storage.objects for select using (
  bucket_id = 'bot-artifacts'
);

drop policy if exists "bot-artifacts-auth-write" on storage.objects;
create policy "bot-artifacts-auth-write" on storage.objects for insert with check (
  bucket_id = 'bot-artifacts' and auth.role() = 'authenticated'
);

drop policy if exists "bot-artifacts-auth-update" on storage.objects;
create policy "bot-artifacts-auth-update" on storage.objects for update using (
  bucket_id = 'bot-artifacts' and auth.role() = 'authenticated'
);

drop policy if exists "bot-artifacts-auth-delete" on storage.objects;
create policy "bot-artifacts-auth-delete" on storage.objects for delete using (
  bucket_id = 'bot-artifacts' and auth.role() = 'authenticated'
);
