import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CookClient from './CookClient'

interface CookPageProps {
  params: Promise<{ planId: string }>
}

export default async function CookPage({ params }: CookPageProps) {
  const { planId } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch the meal plan
  const { data: mealPlan } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('id', planId)
    .eq('user_id', user.id)
    .single()

  if (!mealPlan) {
    redirect('/dashboard')
  }

  // Fetch all meals for this plan with recipes and ingredients
  const { data: meals } = await supabase
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
    .eq('meal_plan_id', planId)
    .order('day_of_week')
    .order('meal_slot')

  if (!meals || meals.length === 0) {
    redirect(`/plan/${mealPlan.week_start}`)
  }

  return (
    <CookClient
      user={user}
      mealPlan={mealPlan}
      meals={meals}
    />
  )
}