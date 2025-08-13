'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTimer } from '@/hooks/useTimer'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChefHat, ArrowLeft, Clock, Check, Timer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CookingTimeline from '@/components/cook/CookingTimeline'
import ActiveTimers from '@/components/cook/ActiveTimers'
import { Database } from '@/lib/types/database'

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

interface CookClientProps {
  user: User
  mealPlan: MealPlan
  meals: Meal[]
}

interface CookingStep {
  id: string
  recipeId: string
  recipeName: string
  order: number
  text: string
  timeSeconds?: number
  isCompleted: boolean
  startTime?: number
}

interface Timer {
  id: string
  stepId: string
  recipeName: string
  stepText: string
  duration: number
  remaining: number
  isActive: boolean
  isCompleted: boolean
}

export default function CookClient({ mealPlan, meals }: CookClientProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'step-by-step'>('overview')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const router = useRouter()
  
  // Use the enhanced timer hook
  const {
    timers,
    createTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    removeTimer,
    formatTime
  } = useTimer({ showBrowserNotification: true, playSound: false })

  // Generate all cooking steps from all recipes
  const allSteps = useMemo(() => {
    const steps: CookingStep[] = []
    
    meals.forEach(meal => {
      if (meal.recipes.steps && Array.isArray(meal.recipes.steps)) {
        meal.recipes.steps.forEach(step => {
          steps.push({
            id: `${meal.id}-${step.order}`,
            recipeId: meal.recipe_id,
            recipeName: meal.recipes.name,
            order: step.order,
            text: step.text,
            timeSeconds: step.time_s,
            isCompleted: false,
          })
        })
      }
    })
    
    // Sort steps to optimize for parallel cooking
    return steps.sort((a, b) => {
      // Prioritize steps with timers first, then by recipe
      if (a.timeSeconds && !b.timeSeconds) return -1
      if (!a.timeSeconds && b.timeSeconds) return 1
      return a.recipeName.localeCompare(b.recipeName) || a.order - b.order
    })
  }, [meals])

  const progress = (completedSteps.size / allSteps.length) * 100

  const startStepTimer = (step: CookingStep) => {
    if (!step.timeSeconds) return
    
    const timerId = createTimer(
      step.recipeName,
      step.text,
      step.timeSeconds
    )
    
    startTimer(timerId)
  }

  const toggleTimer = (timerId: string) => {
    const timer = timers.find(t => t.id === timerId)
    if (!timer) return
    
    if (timer.isActive) {
      pauseTimer(timerId)
    } else {
      startTimer(timerId)
    }
  }

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
    
    // Auto-advance to next step in step-by-step mode
    if (currentView === 'step-by-step' && currentStepIndex < allSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const currentStep = allSteps[currentStepIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/plan/${mealPlan.week_start}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Plan
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Guided Cooking - Week of {new Date(mealPlan.week_start).toLocaleDateString()}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {completedSteps.size} / {allSteps.length} steps
              </Badge>
              <div className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Active Timers */}
        {timers.length > 0 && (
          <div className="mb-8">
            <ActiveTimers
              timers={timers}
              onToggleTimer={toggleTimer}
              onResetTimer={resetTimer}
              onRemoveTimer={removeTimer}
              formatTime={formatTime}
            />
          </div>
        )}

        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'overview' | 'step-by-step')}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Timeline Overview</TabsTrigger>
            <TabsTrigger value="step-by-step">Step-by-Step Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <CookingTimeline
              meals={meals}
              completedSteps={completedSteps}
              onMarkComplete={markStepComplete}
              onStartTimer={startStepTimer}
              formatTime={formatTime}
            />
          </TabsContent>
          
          <TabsContent value="step-by-step">
            {allSteps.length > 0 && currentStep && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      Step {currentStepIndex + 1} of {allSteps.length}
                    </Badge>
                    <Badge variant="secondary">
                      {currentStep.recipeName}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    {currentStep.text}
                  </CardTitle>
                  {currentStep.timeSeconds && (
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Estimated time: {formatTime(currentStep.timeSeconds)}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    {currentStep.timeSeconds && (
                      <Button 
                        variant="outline" 
                        onClick={() => startStepTimer(currentStep)}
                        disabled={timers.some(t => t.description === currentStep.text)}
                      >
                        <Timer className="h-4 w-4 mr-2" />
                        Start Timer
                      </Button>
                    )}
                    
                    <Button 
                      onClick={() => markStepComplete(currentStep.id)}
                      disabled={completedSteps.has(currentStep.id)}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {completedSteps.has(currentStep.id) ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                      disabled={currentStepIndex === 0}
                    >
                      Previous Step
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentStepIndex(Math.min(allSteps.length - 1, currentStepIndex + 1))}
                      disabled={currentStepIndex === allSteps.length - 1}
                    >
                      Next Step
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Completion Message */}
        {progress === 100 && (
          <Card className="max-w-md mx-auto mt-8 text-center">
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold mb-2">Cooking Complete!</h3>
              <p className="text-muted-foreground mb-4">
                Great job! You&apos;ve completed all the cooking steps for your meal plan.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}