-- FRAME/SHIFT schema, prepared for a new dedicated Supabase project.
-- Apply as a migration after the target organisation/project is confirmed.
-- No existing projects or user records are modified by this repository.
begin;

create table public.agency_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 160),
  discipline text not null,
  category text not null check (category in ('Hybrid', 'Film & photo', 'Generative AI')),
  image text not null check (image like '/images/%'),
  alt text not null,
  description text not null,
  brief text not null,
  approach text not null,
  deliverables text[] not null default '{}',
  is_concept boolean not null default true,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.agency_projects enable row level security;
revoke all on public.agency_projects from anon, authenticated;
grant select on public.agency_projects to anon, authenticated;
grant all on public.agency_projects to service_role;
create policy "Published portfolio only" on public.agency_projects
  for select to anon, authenticated using (published = true);

create table public.agency_enquiries (
  id uuid primary key,
  reference text not null unique,
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) <= 254 and email like '%@%.%'),
  company text not null default '' check (char_length(company) <= 160),
  production_type text not null check (production_type in ('Hybrid production','Film & photography','Generative AI','Help me decide')),
  deliverables text[] not null default '{}' check (cardinality(deliverables) <= 5 and deliverables <@ array['Brand film','Campaign photography','Social content','Product imagery','Visual development']::text[]),
  budget text not null check (budget in ('Under €5,000','€5,000–€15,000','€15,000–€30,000','€30,000–€75,000','€75,000+','Let’s discuss')),
  timeline text not null check (timeline in ('Within a month','1–3 months','3–6 months','Still exploring')),
  brief text not null check (char_length(brief) between 20 and 5000),
  contact_consent boolean not null default true check (contact_consent = true),
  privacy_version text not null default '2026-09-09',
  status text not null default 'new' check (status in ('new','reviewing','contacted','closed')),
  ip_hash text not null check (char_length(ip_hash) = 64),
  created_at timestamptz not null default now()
);
alter table public.agency_enquiries enable row level security;
revoke all on public.agency_enquiries from anon, authenticated;
grant all on public.agency_enquiries to service_role;
-- No public policies: enquiries are never readable or writable by site visitors.
create index agency_enquiries_email_created on public.agency_enquiries (email, created_at desc);
create index agency_enquiries_ip_created on public.agency_enquiries (ip_hash, created_at desc);

-- Service-only invoker function; database rate limits and insertion share one transaction.
-- The public API never receives the service/secret key.
create function public.agency_submit_enquiry(
  p_request_id uuid, p_name text, p_email text, p_company text,
  p_production_type text, p_deliverables text[], p_budget text,
  p_timeline text, p_brief text, p_ip_hash text
) returns text
language plpgsql security invoker
set search_path = ''
as $$
declare
  existing_reference text;
  enquiry_reference text;
begin
  -- Lock all dimensions in the same order to avoid races across server instances.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('agency-id:' || p_request_id::text,0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('agency-email:' || lower(p_email),0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('agency-ip:' || p_ip_hash,0));
  select reference into existing_reference from public.agency_enquiries
    where id = p_request_id and email = lower(p_email);
  if found then return existing_reference; end if;
  if (select count(*) from public.agency_enquiries where email = lower(p_email) and created_at > now() - interval '1 hour') >= 3
    or (select count(*) from public.agency_enquiries where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') >= 10
  then raise exception 'rate_limit_exceeded'; end if;
  enquiry_reference := 'FS-' || upper(replace(p_request_id::text,'-',''));
  insert into public.agency_enquiries (id,reference,name,email,company,production_type,deliverables,budget,timeline,brief,ip_hash)
    values (p_request_id,enquiry_reference,btrim(p_name),lower(p_email),btrim(p_company),p_production_type,p_deliverables,p_budget,p_timeline,btrim(p_brief),p_ip_hash);
  return enquiry_reference;
end;
$$;
revoke all on function public.agency_submit_enquiry(uuid,text,text,text,text,text[],text,text,text,text) from public, anon, authenticated;
grant execute on function public.agency_submit_enquiry(uuid,text,text,text,text,text[],text,text,text,text) to service_role;

commit;
