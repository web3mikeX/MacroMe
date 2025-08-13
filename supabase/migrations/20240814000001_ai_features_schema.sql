-- MacroMe AI Features Schema Extensions
-- Adds tables and functions to support AI-powered meal planning features

-- User preferences and learning data
create table if not exists public.user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  preference_type text not null check (preference_type in (
    'ingredient_like', 'ingredient_dislike', 'cuisine_preference', 'cooking_method',
    'dietary_restriction', 'meal_timing', 'spice_level', 'texture_preference'
  )),
  preference_value text not null,
  confidence_score numeric(3,2) default 0.5 check (confidence_score >= 0 and confidence_score <= 1),
  source text default 'user_input' check (source in ('user_input', 'behavior_analysis', 'ai_inference')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, preference_type, preference_value)
);

-- AI-generated recipe variations
create table if not exists public.recipe_variations (
  id uuid default gen_random_uuid() primary key,
  base_recipe_id uuid references public.recipes(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  variation_prompt text not null,
  modified_ingredients jsonb not null,
  modified_instructions jsonb not null,
  calculated_macros jsonb not null, -- {calories, protein, carbs, fat}
  confidence_score numeric(3,2) default 0.5 check (confidence_score >= 0 and confidence_score <= 1),
  usage_count integer default 0,
  rating numeric(2,1) check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI meal suggestions and recommendations
create table if not exists public.ai_meal_suggestions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  suggestion_type text not null check (suggestion_type in (
    'pantry_based', 'macro_optimized', 'preference_based', 'seasonal', 'cost_optimized'
  )),
  suggested_recipes jsonb not null, -- Array of recipe IDs and adaptations
  reasoning text, -- AI explanation for the suggestion
  macro_targets jsonb, -- Target macros that influenced the suggestion
  confidence_score numeric(3,2) default 0.5,
  was_accepted boolean default false,
  user_feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User interaction tracking for AI learning
create table if not exists public.user_interactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  interaction_type text not null check (interaction_type in (
    'recipe_view', 'recipe_cook', 'recipe_rate', 'recipe_skip', 'ingredient_substitute',
    'meal_complete', 'meal_skip', 'shopping_list_generate', 'suggestion_accept', 'suggestion_reject'
  )),
  entity_type text not null check (entity_type in ('recipe', 'ingredient', 'meal_plan', 'suggestion')),
  entity_id uuid not null,
  metadata jsonb, -- Additional context (ratings, substitutions made, etc.)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI optimization cache for performance
create table if not exists public.ai_optimization_cache (
  id uuid default gen_random_uuid() primary key,
  cache_key text not null unique,
  user_id uuid references public.users(id) on delete cascade,
  request_type text not null,
  request_parameters jsonb not null,
  ai_response jsonb not null,
  confidence_score numeric(3,2),
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on new tables
alter table public.user_preferences enable row level security;
alter table public.recipe_variations enable row level security;
alter table public.ai_meal_suggestions enable row level security;
alter table public.user_interactions enable row level security;
alter table public.ai_optimization_cache enable row level security;

-- RLS Policies for user_preferences
create policy "Users can manage own preferences" on public.user_preferences
  for all using (auth.uid() = user_id);

-- RLS Policies for recipe_variations
create policy "Users can manage own recipe variations" on public.recipe_variations
  for all using (auth.uid() = user_id);

-- RLS Policies for ai_meal_suggestions
create policy "Users can view own AI suggestions" on public.ai_meal_suggestions
  for all using (auth.uid() = user_id);

-- RLS Policies for user_interactions
create policy "Users can manage own interactions" on public.user_interactions
  for all using (auth.uid() = user_id);

-- RLS Policies for ai_optimization_cache
create policy "Users can access own AI cache" on public.ai_optimization_cache
  for all using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_user_preferences_user_type on public.user_preferences(user_id, preference_type);
create index if not exists idx_recipe_variations_base_recipe on public.recipe_variations(base_recipe_id);
create index if not exists idx_recipe_variations_user on public.recipe_variations(user_id);
create index if not exists idx_ai_suggestions_user_type on public.ai_meal_suggestions(user_id, suggestion_type);
create index if not exists idx_user_interactions_user_type on public.user_interactions(user_id, interaction_type);
create index if not exists idx_user_interactions_entity on public.user_interactions(entity_type, entity_id);
create index if not exists idx_ai_cache_key on public.ai_optimization_cache(cache_key);
create index if not exists idx_ai_cache_expires on public.ai_optimization_cache(expires_at);

-- Function to update updated_at timestamp
create or replace function update_updated_at_ai()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at on AI tables
drop trigger if exists update_user_preferences_updated_at on public.user_preferences;
create trigger update_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function update_updated_at_ai();

drop trigger if exists update_recipe_variations_updated_at on public.recipe_variations;
create trigger update_recipe_variations_updated_at
  before update on public.recipe_variations
  for each row execute function update_updated_at_ai();

-- Function to clean expired AI cache entries
create or replace function clean_expired_ai_cache()
returns void as $$
begin
  delete from public.ai_optimization_cache 
  where expires_at < now();
end;
$$ language plpgsql security definer;

-- Function to track user interactions (called from application)
create or replace function track_user_interaction(
  p_user_id uuid,
  p_interaction_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb default null
)
returns uuid as $$
declare
  interaction_id uuid;
begin
  insert into public.user_interactions (
    user_id, interaction_type, entity_type, entity_id, metadata
  ) values (
    p_user_id, p_interaction_type, p_entity_type, p_entity_id, p_metadata
  ) returning id into interaction_id;
  
  return interaction_id;
end;
$$ language plpgsql security definer;

-- Function to get user preference weights for AI recommendations
create or replace function get_user_preference_weights(p_user_id uuid)
returns jsonb as $$
declare
  preferences jsonb;
begin
  select jsonb_object_agg(
    preference_type, 
    jsonb_build_object(
      'values', array_agg(preference_value),
      'avg_confidence', avg(confidence_score)
    )
  ) into preferences
  from public.user_preferences
  where user_id = p_user_id
  group by preference_type;
  
  return coalesce(preferences, '{}'::jsonb);
end;
$$ language plpgsql security definer;

-- Function to update user preferences based on interactions
create or replace function update_preferences_from_interactions()
returns trigger as $$
begin
  -- Example: If user consistently skips recipes with certain ingredients,
  -- automatically create negative preferences
  if new.interaction_type = 'recipe_skip' then
    -- This would contain more sophisticated logic to infer preferences
    -- For now, just log that we should analyze this interaction
    null;
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Trigger to analyze interactions for preference learning
drop trigger if exists analyze_interactions_for_preferences on public.user_interactions;
create trigger analyze_interactions_for_preferences
  after insert on public.user_interactions
  for each row execute function update_preferences_from_interactions();