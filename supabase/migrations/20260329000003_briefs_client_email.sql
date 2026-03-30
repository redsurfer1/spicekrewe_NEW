-- Contact email for transactional flows (onboarding drip, etc.). Additive to public.briefs.

alter table public.briefs
  add column if not exists client_email text;

create index if not exists briefs_client_email_idx on public.briefs (client_email)
  where client_email is not null;
