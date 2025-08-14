'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChefHat,
  Plus,
  Target,
  LogOut,
  Calendar,
  Eye,
  Clock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import PantryManager from '@/components/dashboard/PantryManager'
import MacroTargets from '@/components/dashboard/MacroTargets'
import AIPoweredInsights from '@/components/dashboard/AIPoweredInsights'
import { Database } from '@/lib/types/database'

type UserProfile = Database['public']['Tables']['users']['Row']
type PantryItem = Database['public']['Tables']['pantry_items']['Row'] & {
  ingredients: Database['public']['Tables']['ingredients']['Row']
}
type Ingredient = Database['public']['Tables']['ingredients']['Row']
type MealPlan = Database['public']['Tables']['meal_plans']['Row']

interface DashboardClientProps {
  user: User
  userProfile: UserProfile | null
  pantryItems: PantryItem[]
  ingredients: Ingredient[]
}

export default function DashboardClient({
  user,
  userProfile,
  pantryItems: initialPantryItems,
  ingredients,
}: DashboardClientProps) {
  const [pantryItems, setPantryItems] = useState(initialPantryItems)
  const [isGenerating, setIsGenerating] = useState(false)
  const [existingPlans, setExistingPlans] = useState<MealPlan[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchExistingPlans()
  }, [user.id, fetchExistingPlans])

  const fetchExistingPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(5)

      if (error) throw error
      setExistingPlans(data || [])
    } catch (error) {
      console.error('Error fetching meal plans:', error)
    } finally {
      setIsLoadingPlans(false)
    }
  }, [user.id, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const generateWeeklyPlan = async () => {
    setIsGenerating(true)
    try {
      toast.success('Generating your macro-optimized meal plan...')

      const today = new Date()
      const monday = new Date(
        today.setDate(today.getDate() - today.getDay() + 1)
      )
      const weekString = monday.toISOString().split('T')[0]

      // Call the Macro Tetris algorithm
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          weekStart: weekString,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate meal plan')
      }

      const result = await response.json()

      toast.success(
        `Meal plan generated! Macro accuracy: ${Math.round((result.macroAccuracy.calories + result.macroAccuracy.protein + result.macroAccuracy.carbs + result.macroAccuracy.fat) / 4)}%`
      )

      if (result.missingIngredients.length > 0) {
        toast.warning(
          `Note: ${result.missingIngredients.length} ingredients need to be purchased`
        )
      }

      // Refresh existing plans and navigate to the generated plan
      await fetchExistingPlans()
      router.push(`/plan/${weekString}`)
    } catch (error) {
      console.error('Meal plan generation failed:', error)
      toast.error(
        'Failed to generate meal plan. Please check your pantry and try again.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const totalItems = pantryItems.length
  const caloriesPerDay = userProfile?.kcal_target || 2000
  const proteinTarget = Math.round(
    (caloriesPerDay * (userProfile?.protein_pct || 30)) / 100 / 4
  )
  const carbTarget = Math.round(
    (caloriesPerDay * (userProfile?.carb_pct || 40)) / 100 / 4
  )
  const fatTarget = Math.round(
    (caloriesPerDay * (userProfile?.fat_pct || 30)) / 100 / 9
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">MacroMe</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Daily Calories
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {caloriesPerDay.toLocaleString('en-US')}
              </div>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>P: {proteinTarget}g</span>
                <span>C: {carbTarget}g</span>
                <span>F: {fatTarget}g</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pantry Items
              </CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-sm text-muted-foreground">
                Ingredients available for planning
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Status</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ready</div>
              <p className="text-sm text-muted-foreground">
                Ready to generate new plan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Insights Section */}
        <div className="mb-8">
          <AIPoweredInsights
            userId={user.id}
            pantryItems={pantryItems}
            userProfile={userProfile}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Macro Targets */}
          <MacroTargets userProfile={userProfile} />

          {/* Generate Plan Button */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Classic Meal Plan
              </CardTitle>
              <CardDescription>
                Generate a macro-optimized meal plan using the original Macro
                Tetris algorithm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Badge variant={totalItems > 5 ? 'default' : 'secondary'}>
                  {totalItems} pantry items available
                </Badge>
                <Badge
                  variant={userProfile?.kcal_target ? 'default' : 'secondary'}
                >
                  Macro targets{' '}
                  {userProfile?.kcal_target ? 'configured' : 'need setup'}
                </Badge>
              </div>

              <Button
                onClick={generateWeeklyPlan}
                disabled={isGenerating || totalItems === 0}
                className="w-full"
                size="lg"
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Generate Classic Plan
                  </>
                )}
              </Button>

              {totalItems === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Add some ingredients to your pantry first
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Existing Meal Plans */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Meal Plans
              </CardTitle>
              <CardDescription>
                View and manage your existing meal plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPlans ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading meal plans...</p>
                </div>
              ) : existingPlans.length > 0 ? (
                <div className="space-y-3">
                  {existingPlans.map((plan) => {
                    const weekDate = new Date(plan.week_start)
                    const today = new Date()
                    const isCurrent =
                      weekDate <= today &&
                      weekDate.getTime() + 7 * 24 * 60 * 60 * 1000 >
                        today.getTime()

                    return (
                      <div
                        key={plan.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                Week of{' '}
                                {weekDate.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              {isCurrent && (
                                <Badge variant="default" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Target:{' '}
                              {plan.target_calories?.toLocaleString('en-US')}{' '}
                              calories
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/plan/${plan.week_start}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Plan
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/cook/${plan.id}`)}
                          >
                            <ChefHat className="h-4 w-4 mr-2" />
                            Cook
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No meal plans yet</p>
                  <p className="text-sm">
                    Generate your first meal plan to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pantry Manager */}
        <div className="mt-8">
          <PantryManager
            pantryItems={pantryItems}
            ingredients={ingredients}
            onPantryUpdate={setPantryItems}
          />
        </div>
      </div>
    </div>
  )
}
