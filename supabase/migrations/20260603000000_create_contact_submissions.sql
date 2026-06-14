create table if not exists contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  message     text not null,
  created_at  timestamptz default now()
);

-- Only the service role (Edge Function) can insert/read
alter table contact_submissions enable row level security;

create policy "service role only"
  on contact_submissions
  for all
  using (auth.role() = 'service_role');
