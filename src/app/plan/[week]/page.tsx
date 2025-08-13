import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MealPlanClient from './MealPlanClient'

interface MealPlanPageProps {
  params: Promise<{ week: string }>
}

export default async function MealPlanPage({ params }: MealPlanPageProps) {
  const { week } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Parse the week parameter (should be in YYYY-MM-DD format for Monday)
  const weekStart = new Date(week)
  if (isNaN(weekStart.getTime())) {
    redirect('/dashboard')
  }

  // Fetch user profile for macro targets
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch existing meal plan for this week
  const { data: mealPlan } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start', week)
    .single()

  // Fetch meals for this plan if it exists
  const { data: meals } = mealPlan ? await supabase
    .from('meals')
    .select(`
      *,
      recipes (
        *,
        recipe_ingredients (
          *,
          ingredients (*)
        )
      )
    `)
    .eq('meal_plan_id', mealPlan.id)
    .order('day_of_week')
    .order('meal_slot') : { data: [] }

  // Fetch all recipes for adding to the plan
  const { data: recipes } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        *,
        ingredients (*)
      )
    `)
    .order('name')

  return (
    <MealPlanClient
      user={user}
      userProfile={userProfile}
      weekStart={week}
      mealPlan={mealPlan}
      meals={meals || []}
      recipes={recipes || []}
    />
  )
}