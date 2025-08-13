'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Check, Timer, ChefHat } from 'lucide-react'
import { Database } from '@/lib/types/database'

type Meal = Database['public']['Tables']['meals']['Row'] & {
  recipes: Database['public']['Tables']['recipes']['Row'] & {
    recipe_ingredients: Array<
      Database['public']['Tables']['recipe_ingredients']['Row'] & {
        ingredients: Database['public']['Tables']['ingredients']['Row']
      }
    >
  }
}

interface CookingStep {
  id: string
  recipeId: string
  recipeName: string
  order: number
  text: string
  timeSeconds?: number
  isCompleted: boolean
}

interface CookingTimelineProps {
  meals: Meal[]
  completedSteps: Set<string>
  onMarkComplete: (stepId: string) => void
  onStartTimer: (step: CookingStep) => void
  formatTime: (seconds: number) => string
}

export default function CookingTimeline({ 
  meals, 
  completedSteps, 
  onMarkComplete, 
  onStartTimer, 
  formatTime 
}: CookingTimelineProps) {
  const getStepsForMeal = (meal: Meal) => {
    if (!meal.recipes.steps || !Array.isArray(meal.recipes.steps)) return []
    
    return meal.recipes.steps.map(step => ({
      id: `${meal.id}-${step.order}`,
      recipeId: meal.recipe_id,
      recipeName: meal.recipes.name,
      order: step.order,
      text: step.text,
      timeSeconds: step.time_s,
      isCompleted: completedSteps.has(`${meal.id}-${step.order}`),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Batch Cooking Timeline</h2>
        <p className="text-muted-foreground">
          Follow this optimized timeline to prep all your meals efficiently. Steps with timers can run in parallel.
        </p>
      </div>

      {meals.map((meal) => {
        const steps = getStepsForMeal(meal)
        const completedCount = steps.filter(step => step.isCompleted).length
        const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0

        return (
          <Card key={meal.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  {meal.recipes.name}
                  {meal.servings > 1 && (
                    <Badge variant="secondary">
                      {meal.servings} servings
                    </Badge>
                  )}
                </CardTitle>
                <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                  {completedCount} / {steps.length} steps
                </Badge>
              </div>
              <CardDescription>
                {meal.recipes.skill_level && (
                  <span className="capitalize">
                    {meal.recipes.skill_level} level • {' '}
                  </span>
                )}
                {steps.reduce((total, step) => total + (step.timeSeconds || 0), 0) > 0 && (
                  <span>
                    Total time: {formatTime(steps.reduce((total, step) => total + (step.timeSeconds || 0), 0))}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {steps.map((step, stepIndex) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      step.isCompleted
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                      {step.isCompleted ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        stepIndex + 1
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${step.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {step.text}
                      </p>
                      {step.timeSeconds && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(step.timeSeconds)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {step.timeSeconds && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStartTimer(step)}
                        >
                          <Timer className="h-3 w-3 mr-1" />
                          Timer
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant={step.isCompleted ? 'secondary' : 'default'}
                        onClick={() => onMarkComplete(step.id)}
                        disabled={step.isCompleted}
                      >
                        {step.isCompleted ? 'Done' : 'Complete'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}