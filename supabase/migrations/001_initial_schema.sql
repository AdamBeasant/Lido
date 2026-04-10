-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- HOLIDAYS
-- ============================================
create table public.holidays (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  image_url text,
  image_blur_hash text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_by uuid references auth.users(id) on delete cascade not null default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- HOLIDAY MEMBERS (sharing)
-- ============================================
create table public.holiday_members (
  id uuid primary key default uuid_generate_v4(),
  holiday_id uuid references public.holidays(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now(),
  unique(holiday_id, user_id)
);

-- ============================================
-- INVITE TOKENS
-- ============================================
create table public.invite_tokens (
  id uuid primary key default uuid_generate_v4(),
  holiday_id uuid references public.holidays(id) on delete cascade not null,
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  created_by uuid references auth.users(id) on delete cascade not null,
  expires_at timestamptz default (now() + interval '7 days'),
  used_at timestamptz,
  used_by uuid references auth.users(id)
);

-- ============================================
-- CHECKLIST ITEMS
-- ============================================
create table public.checklist_items (
  id uuid primary key default uuid_generate_v4(),
  holiday_id uuid references public.holidays(id) on delete cascade not null,
  list_type text not null check (list_type in ('packing', 'todo')),
  category text,
  text text not null,
  checked boolean default false,
  checked_by uuid references auth.users(id),
  checked_at timestamptz,
  position integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================
-- RESTAURANTS
-- ============================================
create table public.restaurants (
  id uuid primary key default uuid_generate_v4(),
  holiday_id uuid references public.holidays(id) on delete cascade not null,
  name text not null,
  cuisine text,
  notes text,
  rating integer check (rating >= 1 and rating <= 5),
  booked boolean default false,
  url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================
-- USER PROFILES
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_holiday_members_user on public.holiday_members(user_id);
create index idx_holiday_members_holiday on public.holiday_members(holiday_id);
create index idx_checklist_holiday on public.checklist_items(holiday_id, list_type);
create index idx_checklist_position on public.checklist_items(holiday_id, list_type, category, position);
create index idx_restaurants_holiday on public.restaurants(holiday_id);
create index idx_invite_token on public.invite_tokens(token);

-- ============================================
-- ENABLE REALTIME
-- ============================================
alter publication supabase_realtime add table public.checklist_items;
alter publication supabase_realtime add table public.restaurants;
alter publication supabase_realtime add table public.holidays;
alter publication supabase_realtime add table public.holiday_members;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.holidays enable row level security;
alter table public.holiday_members enable row level security;
alter table public.checklist_items enable row level security;
alter table public.restaurants enable row level security;
alter table public.invite_tokens enable row level security;
alter table public.profiles enable row level security;

-- Helper: check if user is a member of a holiday
create or replace function public.is_holiday_member(h_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.holiday_members
    where holiday_id = h_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- HOLIDAYS policies
create policy "Users can view holidays they belong to"
  on public.holidays for select using (public.is_holiday_member(id));

create policy "Authenticated users can create holidays"
  on public.holidays for insert with check (auth.uid() = created_by);

create policy "Members can update holidays"
  on public.holidays for update using (public.is_holiday_member(id));

create policy "Owner can delete holidays"
  on public.holidays for delete using (created_by = auth.uid());

-- HOLIDAY_MEMBERS policies
create policy "Members can view co-members"
  on public.holiday_members for select using (public.is_holiday_member(holiday_id));

create policy "Members can add members"
  on public.holiday_members for insert
  with check (user_id = auth.uid());

create policy "Owner can remove members"
  on public.holiday_members for delete using (
    exists (
      select 1 from public.holiday_members hm
      where hm.holiday_id = holiday_members.holiday_id
        and hm.user_id = auth.uid()
        and hm.role = 'owner'
    )
  );

-- CHECKLIST policies
create policy "Members can view checklist"
  on public.checklist_items for select using (public.is_holiday_member(holiday_id));

create policy "Members can insert checklist items"
  on public.checklist_items for insert with check (public.is_holiday_member(holiday_id));

create policy "Members can update checklist items"
  on public.checklist_items for update using (public.is_holiday_member(holiday_id));

create policy "Members can delete checklist items"
  on public.checklist_items for delete using (public.is_holiday_member(holiday_id));

-- RESTAURANT policies
create policy "Members can view restaurants"
  on public.restaurants for select using (public.is_holiday_member(holiday_id));

create policy "Members can insert restaurants"
  on public.restaurants for insert with check (public.is_holiday_member(holiday_id));

create policy "Members can update restaurants"
  on public.restaurants for update using (public.is_holiday_member(holiday_id));

create policy "Members can delete restaurants"
  on public.restaurants for delete using (public.is_holiday_member(holiday_id));

-- INVITE TOKENS policies
create policy "Members can view invites"
  on public.invite_tokens for select using (public.is_holiday_member(holiday_id));

create policy "Members can create invite tokens"
  on public.invite_tokens for insert with check (
    exists (
      select 1 from public.holiday_members
      where holiday_id = invite_tokens.holiday_id and user_id = auth.uid()
    )
  );

-- PROFILES policies
create policy "Anyone can view profiles"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert with check (id = auth.uid());

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-add creator as owner when holiday is created
create or replace function public.handle_holiday_created()
returns trigger as $$
begin
  insert into public.holiday_members (holiday_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_holiday_created
  after insert on public.holidays
  for each row execute function public.handle_holiday_created();

-- Accept invite function
create or replace function public.accept_invite(invite_token text)
returns uuid as $$
declare
  v_holiday_id uuid;
  v_token_id uuid;
begin
  select id, holiday_id into v_token_id, v_holiday_id
  from public.invite_tokens
  where token = invite_token
    and used_at is null
    and expires_at > now();

  if v_holiday_id is null then
    raise exception 'Invalid or expired invite token';
  end if;

  insert into public.holiday_members (holiday_id, user_id, role)
  values (v_holiday_id, auth.uid(), 'member')
  on conflict (holiday_id, user_id) do nothing;

  update public.invite_tokens
  set used_at = now(), used_by = auth.uid()
  where id = v_token_id;

  return v_holiday_id;
end;
$$ language plpgsql security definer;
