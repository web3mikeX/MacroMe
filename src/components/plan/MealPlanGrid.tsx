'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, GripVertical, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
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
type Recipe = Database['public']['Tables']['recipes']['Row'] & {
  recipe_ingredients: Array<
    Database['public']['Tables']['recipe_ingredients']['Row'] & {
      ingredients: Database['public']['Tables']['ingredients']['Row']
    }
  >
}

interface MealPlanGridProps {
  weekStart: string
  meals: Meal[]
  recipes: Recipe[]
  mealPlan: MealPlan | null
  onMealsUpdate: (meals: Meal[]) => void
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack']

interface MealSlotProps {
  day: number
  slot: string
  meal: Meal | undefined
  onAddMeal: (day: number, slot: string) => void
  onRemoveMeal: (meal: Meal) => void
}

function MealSlot({ day, slot, meal, onAddMeal, onRemoveMeal }: MealSlotProps) {
  const calculateNutrition = (meal: Meal) => {
    if (!meal.recipes || !meal.recipes.recipe_ingredients) return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    
    let calories = 0
    let protein = 0
    let carbs = 0
    let fat = 0

    meal.recipes.recipe_ingredients.forEach(ingredient => {
      const quantity = ingredient.quantity
      const nutrition = ingredient.ingredients
      const servingMultiplier = meal.servings
      
      calories += (nutrition.kcal * quantity * servingMultiplier) / 100
      protein += (nutrition.protein * quantity * servingMultiplier) / 100
      carbs += (nutrition.carbs * quantity * servingMultiplier) / 100
      fat += (nutrition.fat * quantity * servingMultiplier) / 100
    })

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    }
  }

  if (!meal) {
    return (
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[120px] flex items-center justify-center hover:border-gray-400 cursor-pointer transition-colors"
        onClick={() => onAddMeal(day, slot)}
      >
        <div className="text-center text-gray-500">
          <Plus className="h-6 w-6 mx-auto mb-2" />
          <div className="text-sm">Add {slot}</div>
        </div>
      </div>
    )
  }

  const nutrition = calculateNutrition(meal)

  return (
    <Card className="relative group cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium leading-none">
            {meal.recipes.name}
          </CardTitle>
          <div className="flex items-center gap-1">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemoveMeal(meal)}
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        </div>
        {meal.servings > 1 && (
          <Badge variant="secondary" className="text-xs w-fit">
            {meal.servings} servings
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cal:</span>
            <span className="font-medium">{nutrition.calories}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">P:</span>
            <span className="font-medium">{nutrition.protein}g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">C:</span>
            <span className="font-medium">{nutrition.carbs}g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">F:</span>
            <span className="font-medium">{nutrition.fat}g</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MealPlanGrid({ weekStart, meals, recipes, mealPlan, onMealsUpdate }: MealPlanGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number>(0)
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [selectedRecipe, setSelectedRecipe] = useState<string>('')
  const [servings, setServings] = useState<string>('1')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  // Create a grid structure for easier rendering
  const mealGrid = DAYS.map((day, dayIndex) => 
    MEAL_SLOTS.map(slot => ({
      day: dayIndex,
      slot,
      meal: meals.find(meal => meal.day_of_week === dayIndex && meal.meal_slot === slot)
    }))
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || !active.id || active.id === over.id) return

    try {
      // Parse the drag data
      const activeId = active.id as string
      const overId = over.id as string
      
      const [activeDay, activeSlot] = activeId.split('-').slice(1)
      const [overDay, overSlot] = overId.split('-').slice(1)
      
      const dayIndex = parseInt(activeDay)
      const overDayIndex = parseInt(overDay)
      
      // Find the meal being moved
      const mealToMove = meals.find(meal => 
        meal.day_of_week === dayIndex && meal.meal_slot === activeSlot
      )
      
      if (!mealToMove) return

      // Update in database
      const { error } = await supabase
        .from('meals')
        .update({
          day_of_week: overDayIndex,
          meal_slot: overSlot,
        })
        .eq('id', mealToMove.id)

      if (error) throw error

      // Update local state
      const updatedMeals = meals.map(meal =>
        meal.id === mealToMove.id
          ? { ...meal, day_of_week: overDayIndex, meal_slot: overSlot }
          : meal
      )
      
      onMealsUpdate(updatedMeals)
      toast.success('Meal moved successfully!')
    } catch (error) {
      console.error('Error moving meal:', error)
      toast.error('Failed to move meal')
    }
  }

  const handleAddMeal = (day: number, slot: string) => {
    setSelectedDay(day)
    setSelectedSlot(slot)
    setIsAddDialogOpen(true)
  }

  const handleConfirmAdd = async () => {
    if (!selectedRecipe || !servings || !mealPlan) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('meals')
        .insert({
          meal_plan_id: mealPlan.id,
          recipe_id: selectedRecipe,
          servings: parseInt(servings),
          day_of_week: selectedDay,
          meal_slot: selectedSlot,
        })
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
        .single()

      if (error) throw error
      if (data) {
        onMealsUpdate([...meals, data as Meal])
        toast.success('Meal added successfully!')
        setIsAddDialogOpen(false)
        setSelectedRecipe('')
        setServings('1')
      }
    } catch (error) {
      console.error('Error adding meal:', error)
      toast.error('Failed to add meal')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMeal = async (meal: Meal) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', meal.id)

      if (error) throw error

      onMealsUpdate(meals.filter(m => m.id !== meal.id))
      toast.success('Meal removed successfully!')
    } catch (error) {
      console.error('Error removing meal:', error)
      toast.error('Failed to remove meal')
    }
  }

  if (!mealPlan) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No meal plan found</h3>
            <p className="text-muted-foreground mb-4">
              Generate a meal plan from your dashboard to get started.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-7 gap-4">
          {/* Day headers */}
          {DAYS.map((day, index) => (
            <div key={day} className="text-center font-medium text-gray-700 mb-2">
              <div>{day}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(new Date(weekStart).getTime() + index * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          ))}
          
          {/* Meal slots */}
          {MEAL_SLOTS.map(slot => 
            DAYS.map((day, dayIndex) => {
              const meal = meals.find(m => m.day_of_week === dayIndex && m.meal_slot === slot)
              const slotId = `slot-${dayIndex}-${slot}`
              
              return (
                <div 
                  key={slotId}
                  id={slotId}
                  className="min-h-[120px]"
                >
                  <MealSlot
                    day={dayIndex}
                    slot={slot}
                    meal={meal}
                    onAddMeal={handleAddMeal}
                    onRemoveMeal={handleRemoveMeal}
                  />
                </div>
              )
            })
          )}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-50">
              {/* Render dragging meal preview */}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add Meal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Meal</DialogTitle>
            <DialogDescription>
              Add a recipe to {DAYS[selectedDay]} {selectedSlot}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipe">Recipe</Label>
              <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>
            <Button onClick={handleConfirmAdd} disabled={isLoading} className="w-full">
              {isLoading ? 'Adding...' : 'Add Meal'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}