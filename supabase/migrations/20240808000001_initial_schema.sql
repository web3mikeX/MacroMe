-- MacroMe - Users table (extends auth.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  kcal_target integer default 2000,
  protein_pct integer default 30,
  carb_pct integer default 40,
  fat_pct integer default 30,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ingredients table
create table if not exists public.ingredients (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  unit text not null,
  protein numeric(5,2) not null default 0,
  carbs numeric(5,2) not null default 0,
  fat numeric(5,2) not null default 0,
  kcal numeric(5,2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pantry items (user's inventory)
create table if not exists public.pantry_items (
  user_id uuid references public.users(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id) on delete cascade,
  quantity numeric(8,2) not null,
  unit text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, ingredient_id)
);

-- Recipes table
create table if not exists public.recipes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  steps jsonb not null,
  skill_level text not null check (skill_level in ('beginner', 'intermediate', 'advanced')),
  default_servings integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recipe ingredients junction table
create table if not exists public.recipe_ingredients (
  recipe_id uuid references public.recipes(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id) on delete cascade,
  quantity numeric(8,2) not null,
  unit text not null,
  primary key (recipe_id, ingredient_id)
);

-- Meal plans table
create table if not exists public.meal_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  week_start date not null,
  total_kcal integer not null default 0,
  total_protein integer not null default 0,
  total_carbs integer not null default 0,
  total_fat integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, week_start)
);

-- Meals table
create table if not exists public.meals (
  id uuid default gen_random_uuid() primary key,
  meal_plan_id uuid references public.meal_plans(id) on delete cascade,
  recipe_id uuid references public.recipes(id) on delete cascade,
  servings integer not null default 1,
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.pantry_items enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meals enable row level security;

-- RLS Policies for users table
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'users' and policyname = 'Users can view own profile') then
    create policy "Users can view own profile" on public.users
      for select using (auth.uid() = id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'users' and policyname = 'Users can update own profile') then
    create policy "Users can update own profile" on public.users
      for update using (auth.uid() = id);
  end if;
end $$;

-- RLS Policies for pantry_items
create policy "Users can view own pantry items" on public.pantry_items
  for select using (auth.uid() = user_id);

create policy "Users can insert own pantry items" on public.pantry_items
  for insert with check (auth.uid() = user_id);

create policy "Users can update own pantry items" on public.pantry_items
  for update using (auth.uid() = user_id);

create policy "Users can delete own pantry items" on public.pantry_items
  for delete using (auth.uid() = user_id);

-- RLS Policies for meal_plans
create policy "Users can view own meal plans" on public.meal_plans
  for select using (auth.uid() = user_id);

create policy "Users can insert own meal plans" on public.meal_plans
  for insert with check (auth.uid() = user_id);

create policy "Users can update own meal plans" on public.meal_plans
  for update using (auth.uid() = user_id);

create policy "Users can delete own meal plans" on public.meal_plans
  for delete using (auth.uid() = user_id);

-- RLS Policies for meals
create policy "Users can view own meals" on public.meals
  for select using (
    exists (
      select 1 from public.meal_plans
      where meal_plans.id = meals.meal_plan_id
      and meal_plans.user_id = auth.uid()
    )
  );

create policy "Users can insert own meals" on public.meals
  for insert with check (
    exists (
      select 1 from public.meal_plans
      where meal_plans.id = meals.meal_plan_id
      and meal_plans.user_id = auth.uid()
    )
  );

create policy "Users can update own meals" on public.meals
  for update using (
    exists (
      select 1 from public.meal_plans
      where meal_plans.id = meals.meal_plan_id
      and meal_plans.user_id = auth.uid()
    )
  );

create policy "Users can delete own meals" on public.meals
  for delete using (
    exists (
      select 1 from public.meal_plans
      where meal_plans.id = meals.meal_plan_id
      and meal_plans.user_id = auth.uid()
    )
  );

-- Public read access for ingredients and recipes (no RLS needed)
-- These tables contain reference data that all users can read

-- Function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
  before update on public.users
  for each row execute function update_updated_at();

drop trigger if exists update_pantry_items_updated_at on public.pantry_items;
create trigger update_pantry_items_updated_at
  before update on public.pantry_items
  for each row execute function update_updated_at();

drop trigger if exists update_meal_plans_updated_at on public.meal_plans;
create trigger update_meal_plans_updated_at
  before update on public.meal_plans
  for each row execute function update_updated_at();