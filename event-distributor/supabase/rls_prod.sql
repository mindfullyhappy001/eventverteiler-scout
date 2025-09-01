-- Production RLS policies for Event-Verteiler (Supabase-only)
--
-- IMPORTANT
-- 1) This script enables RLS on all app tables and creates STRICT policies.
-- 2) By default, ONLY authenticated users can read and write.
-- 3) OPTIONAL: You can restrict access to a single admin account by email.
--    To do so, replace <ADMIN_EMAIL> below and UNCOMMENT the single-admin section,
--    then DROP the generic authenticated-only policies or run this in a clean project.
--
-- Tables covered:
--   "Event", "EventVersion", "PlatformConfig", "PublishJob", "EventPublication", "LogEntry"
--
-- Remove any demo/open policies before applying this file.

-- Enable RLS on all tables
alter table "Event" enable row level security;
alter table "EventVersion" enable row level security;
alter table "PlatformConfig" enable row level security;
alter table "PublishJob" enable row level security;
alter table "EventPublication" enable row level security;
alter table "LogEntry" enable row level security;

-- ==============================================
-- VARIANT A (DEFAULT): Authenticated-only access
-- ==============================================
-- Event
drop policy if exists "event_select_authenticated" on "Event";
drop policy if exists "event_modify_authenticated" on "Event";
create policy "event_select_authenticated" on "Event" for select using (auth.role() = 'authenticated');
create policy "event_modify_authenticated" on "Event" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- EventVersion
drop policy if exists "eventversion_select_authenticated" on "EventVersion";
drop policy if exists "eventversion_modify_authenticated" on "EventVersion";
create policy "eventversion_select_authenticated" on "EventVersion" for select using (auth.role() = 'authenticated');
create policy "eventversion_modify_authenticated" on "EventVersion" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PlatformConfig
drop policy if exists "platformconfig_select_authenticated" on "PlatformConfig";
drop policy if exists "platformconfig_modify_authenticated" on "PlatformConfig";
create policy "platformconfig_select_authenticated" on "PlatformConfig" for select using (auth.role() = 'authenticated');
create policy "platformconfig_modify_authenticated" on "PlatformConfig" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PublishJob
drop policy if exists "publishjob_select_authenticated" on "PublishJob";
drop policy if exists "publishjob_modify_authenticated" on "PublishJob";
create policy "publishjob_select_authenticated" on "PublishJob" for select using (auth.role() = 'authenticated');
create policy "publishjob_modify_authenticated" on "PublishJob" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- EventPublication
drop policy if exists "eventpublication_select_authenticated" on "EventPublication";
drop policy if exists "eventpublication_modify_authenticated" on "EventPublication";
create policy "eventpublication_select_authenticated" on "EventPublication" for select using (auth.role() = 'authenticated');
create policy "eventpublication_modify_authenticated" on "EventPublication" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- LogEntry
drop policy if exists "logentry_select_authenticated" on "LogEntry";
drop policy if exists "logentry_modify_authenticated" on "LogEntry";
create policy "logentry_select_authenticated" on "LogEntry" for select using (auth.role() = 'authenticated');
create policy "logentry_modify_authenticated" on "LogEntry" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- =====================================================================================
-- VARIANT B (OPTIONAL): Single admin by email (uncomment and set <ADMIN_EMAIL> to enforce)
-- =====================================================================================
-- NOTE: If you enable this, remove or drop the policies from VARIANT A to avoid overlap.
-- Replace <ADMIN_EMAIL> with your admin's email address.
--
-- -- Event
-- drop policy if exists "event_select_admin" on "Event";
-- drop policy if exists "event_modify_admin" on "Event";
-- create policy "event_select_admin" on "Event" for select using ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>'));
-- create policy "event_modify_admin" on "Event" for all using ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>')) with check ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>'));
--
-- -- EventVersion
-- drop policy if exists "eventversion_select_admin" on "EventVersion";
-- drop policy if exists "eventversion_modify_admin" on "EventVersion";
-- create policy "eventversion_select_admin" on "EventVersion" for select using ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>'));
-- create policy "eventversion_modify_admin" on "EventVersion" for all using ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>')) with check ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>'));
--
-- -- PlatformConfig
-- drop policy if exists "platformconfig_select_admin" on "PlatformConfig";
-- drop policy if exists "platformconfig_modify_admin" on "PlatformConfig";
-- create policy "platformconfig_select_admin" on "PlatformConfig" for select using ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>'));
-- create policy "platformconfig_modify_admin" on "PlatformConfig" for all using ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>')) with check ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>'));
--
-- -- PublishJob
-- drop policy if exists "publishjob_select_admin" on "PublishJob";
-- drop policy if exists "publishjob_modify_admin" on "PublishJob";
-- create policy "publishjob_select_admin" on "PublishJob" for select using ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>'));
-- create policy "publishjob_modify_admin" on "PublishJob" for all using ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>')) with check ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>'));
--
-- -- EventPublication
-- drop policy if exists "eventpublication_select_admin" on "EventPublication";
-- drop policy if exists "eventpublication_modify_admin" on "EventPublication";
-- create policy "eventpublication_select_admin" on "EventPublication" for select using ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>'));
-- create policy "eventpublication_modify_admin" on "EventPublication" for all using ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>')) with check ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>'));
--
-- -- LogEntry
-- drop policy if exists "logentry_select_admin" on "LogEntry";
-- drop policy if exists "logentry_modify_admin" on "LogEntry";
-- create policy "logentry_select_admin" on "LogEntry" for select using ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>'));
-- create policy "logentry_modify_admin" on "LogEntry" for all using ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>')) with check ((auth.role() = 'authenticated') and (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>'));
