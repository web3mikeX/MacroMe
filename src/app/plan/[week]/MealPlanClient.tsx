'use client'

import { useState, useMemo } from 'react'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChefHat, ArrowLeft, Download, Plus, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import MealPlanGrid from '@/components/plan/MealPlanGrid'
import { Database } from '@/lib/types/database'

type UserProfile = Database['public']['Tables']['users']['Row']
type MealPlan = Database['public']['Tables']['meal_plans']['Row']
type Meal = Database['public']['Tables']['meals']['Row'] & {
  recipes: Database['public']['Tables']['recipes']['Row'] & {
    recipe_ingredients: Array<
      Database['public']['Tables']['recipe_ingredients']['Row'] & {
        ingredients: Database['public']['Tables']['ingredients']['Row']
      }
    >
  }
}
type Recipe = Database['public']['Tables']['recipes']['Row'] & {
  recipe_ingredients: Array<
    Database['public']['Tables']['recipe_ingredients']['Row'] & {
      ingredients: Database['public']['Tables']['ingredients']['Row']
    }
  >
}

interface MealPlanClientProps {
  user: User
  userProfile: UserProfile | null
  weekStart: string
  mealPlan: MealPlan | null
  meals: Meal[]
  recipes: Recipe[]
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack']

export default function MealPlanClient({ 
  user, 
  userProfile, 
  weekStart, 
  mealPlan, 
  meals: initialMeals, 
  recipes 
}: MealPlanClientProps) {
  const [meals, setMeals] = useState(initialMeals)
  const router = useRouter()
  const supabase = createClient()

  // Calculate weekly macro totals
  const weeklyTotals = useMemo(() => {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    meals.forEach(meal => {
      if (meal.recipes && meal.recipes.recipe_ingredients) {
        meal.recipes.recipe_ingredients.forEach(ingredient => {
          const servingMultiplier = meal.servings
          const quantity = ingredient.quantity
          const nutrition = ingredient.ingredients
          
          // Calculate nutrition based on ingredient quantity and servings
          const caloriesPerServing = (nutrition.kcal * quantity) / 100
          const proteinPerServing = (nutrition.protein * quantity) / 100
          const carbsPerServing = (nutrition.carbs * quantity) / 100
          const fatPerServing = (nutrition.fat * quantity) / 100
          
          totalCalories += caloriesPerServing * servingMultiplier
          totalProtein += proteinPerServing * servingMultiplier
          totalCarbs += carbsPerServing * servingMultiplier
          totalFat += fatPerServing * servingMultiplier
        })
      }
    })

    return {
      calories: Math.round(totalCalories / 7), // Daily average
      protein: Math.round(totalProtein / 7),
      carbs: Math.round(totalCarbs / 7),
      fat: Math.round(totalFat / 7),
    }
  }, [meals])

  // Calculate macro targets for the week
  const targets = {
    calories: userProfile?.kcal_target || 2000,
    protein: Math.round(((userProfile?.kcal_target || 2000) * (userProfile?.protein_pct || 30)) / 100 / 4),
    carbs: Math.round(((userProfile?.kcal_target || 2000) * (userProfile?.carb_pct || 40)) / 100 / 4),
    fat: Math.round(((userProfile?.kcal_target || 2000) * (userProfile?.fat_pct || 30)) / 100 / 9),
  }

  // Calculate accuracy (green/amber/red indicators)
  const getAccuracyColor = (actual: number, target: number) => {
    const percentage = Math.abs(actual - target) / target
    if (percentage <= 0.05) return 'bg-green-500' // Within 5%
    if (percentage <= 0.15) return 'bg-yellow-500' // Within 15%
    return 'bg-red-500' // More than 15% off
  }

  const exportGroceryList = () => {
    // Aggregate all ingredients needed for the week
    const ingredientMap = new Map<string, { name: string; quantity: number; unit: string }>()

    meals.forEach(meal => {
      if (meal.recipes && meal.recipes.recipe_ingredients) {
        meal.recipes.recipe_ingredients.forEach(ingredient => {
          const key = ingredient.ingredient_id
          const totalQuantity = ingredient.quantity * meal.servings
          
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!
            existing.quantity += totalQuantity
          } else {
            ingredientMap.set(key, {
              name: ingredient.ingredients.name,
              quantity: totalQuantity,
              unit: ingredient.unit
            })
          }
        })
      }
    })

    // Create CSV content
    const csvContent = [
      'Ingredient,Quantity,Unit',
      ...Array.from(ingredientMap.values()).map(item =>
        `"${item.name}",${item.quantity},"${item.unit}"`
      )
    ].join('\n')

    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grocery-list-${weekStart}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success('Grocery list exported!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Meal Plan - Week of {new Date(weekStart).toLocaleDateString()}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportGroceryList} disabled={meals.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Grocery List
              </Button>
              {mealPlan && (
                <Link href={`/cook/${mealPlan.id}`}>
                  <Button>
                    <ChefHat className="h-4 w-4 mr-2" />
                    Start Cooking
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Macro Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Macro Targets vs Actual (7-day average)
            </CardTitle>
            <CardDescription>
              Color indicators: Green (±5%), Yellow (±15%), Red (&gt;15% off target)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getAccuracyColor(weeklyTotals.calories, targets.calories)}`}></div>
                  <span className="font-medium">Calories</span>
                </div>
                <div className="text-2xl font-bold">{weeklyTotals.calories}</div>
                <div className="text-sm text-muted-foreground">Target: {targets.calories}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getAccuracyColor(weeklyTotals.protein, targets.protein)}`}></div>
                  <span className="font-medium">Protein</span>
                </div>
                <div className="text-2xl font-bold">{weeklyTotals.protein}g</div>
                <div className="text-sm text-muted-foreground">Target: {targets.protein}g</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getAccuracyColor(weeklyTotals.carbs, targets.carbs)}`}></div>
                  <span className="font-medium">Carbs</span>
                </div>
                <div className="text-2xl font-bold">{weeklyTotals.carbs}g</div>
                <div className="text-sm text-muted-foreground">Target: {targets.carbs}g</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getAccuracyColor(weeklyTotals.fat, targets.fat)}`}></div>
                  <span className="font-medium">Fat</span>
                </div>
                <div className="text-2xl font-bold">{weeklyTotals.fat}g</div>
                <div className="text-sm text-muted-foreground">Target: {targets.fat}g</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Plan Grid */}
        <MealPlanGrid
          weekStart={weekStart}
          meals={meals}
          recipes={recipes}
          mealPlan={mealPlan}
          onMealsUpdate={setMeals}
        />
      </div>
    </div>
  )
}