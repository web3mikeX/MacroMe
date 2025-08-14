/**
 * Macro Tetris Algorithm - Intelligent Meal Planning
 *
 * This module implements the core "Macro Tetris" algorithm that generates
 * optimized weekly meal plans based on user macro targets and pantry availability.
 *
 * Algorithm Overview:
 * 1. Fetch user targets + pantry + recipe pool
 * 2. Greedy fill: loop through recipes sorted by protein density, add servings until daily protein ≥ target
 * 3. Fill remaining C/F via complementary recipes/snacks
 * 4. Fine-tune by scaling servings (±10g) to hit macros within ±5%
 * 5. Return plan + list of missing pantry quantities
 */

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

type Recipe = Database['public']['Tables']['recipes']['Row'] & {
  recipe_ingredients: Array<
    Database['public']['Tables']['recipe_ingredients']['Row'] & {
      ingredients: Database['public']['Tables']['ingredients']['Row']
    }
  >
}
type PantryItem = Database['public']['Tables']['pantry_items']['Row'] & {
  ingredients: Database['public']['Tables']['ingredients']['Row']
}
type MealPlan = Database['public']['Tables']['meal_plans']['Row']
type Meal = Database['public']['Tables']['meals']['Row']

interface MacroProfile {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface RecipeWithMacros extends Recipe {
  macros: MacroProfile
  proteinDensity: number // protein per 100 calories
  availableServings: number // based on pantry availability
}

interface OptimizationResult {
  mealPlan: MealPlan
  meals: Meal[]
  missingIngredients: Array<{
    ingredientId: string
    ingredientName: string
    neededQuantity: number
    unit: string
    availableQuantity: number
  }>
  macroAccuracy: {
    calories: number // percentage accuracy
    protein: number
    carbs: number
    fat: number
  }
}

/**
 * Calculate nutrition profile for a recipe based on its ingredients
 */
function calculateRecipeMacros(recipe: Recipe): MacroProfile {
  let calories = 0
  let protein = 0
  let carbs = 0
  let fat = 0

  recipe.recipe_ingredients.forEach((ingredient) => {
    const quantity = ingredient.quantity
    const nutrition = ingredient.ingredients

    // Calculate nutrition based on ingredient quantity (per 100g)
    calories += (nutrition.kcal * quantity) / 100
    protein += (nutrition.protein * quantity) / 100
    carbs += (nutrition.carbs * quantity) / 100
    fat += (nutrition.fat * quantity) / 100
  })

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  }
}

/**
 * Calculate how many servings of a recipe can be made with available pantry items
 */
function calculateAvailableServings(
  recipe: Recipe,
  pantryItems: PantryItem[]
): number {
  let maxServings = Infinity

  recipe.recipe_ingredients.forEach((recipeIngredient) => {
    const pantryItem = pantryItems.find(
      (p) => p.ingredient_id === recipeIngredient.ingredient_id
    )

    if (!pantryItem) {
      maxServings = 0
      return
    }

    // Convert units if needed (simplified - in production would need proper unit conversion)
    const availableQuantity = pantryItem.quantity
    const requiredQuantity = recipeIngredient.quantity

    const possibleServings = Math.floor(availableQuantity / requiredQuantity)
    maxServings = Math.min(maxServings, possibleServings)
  })

  return maxServings === Infinity ? 0 : maxServings
}

/**
 * Sort recipes by protein density (protein per 100 calories) for greedy algorithm
 */
function sortByProteinDensity(recipes: RecipeWithMacros[]): RecipeWithMacros[] {
  return recipes
    .filter((recipe) => recipe.availableServings > 0)
    .sort((a, b) => b.proteinDensity - a.proteinDensity)
}

/**
 * Greedy algorithm: Fill daily protein target first
 */
function greedyProteinFill(
  recipes: RecipeWithMacros[],
  dailyTargets: MacroProfile,
  daysInWeek: number = 7
): {
  selectedRecipes: Array<{
    recipe: RecipeWithMacros
    servings: number
    day: number
    slot: string
  }>
  currentMacros: MacroProfile
} {
  const sortedRecipes = sortByProteinDensity(recipes)
  const selectedRecipes: Array<{
    recipe: RecipeWithMacros
    servings: number
    day: number
    slot: string
  }> = []
  const currentMacros: MacroProfile = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }

  const mealSlots = ['breakfast', 'lunch', 'dinner']
  let currentDay = 0
  let currentSlot = 0

  // TODO: Implement more sophisticated meal slot assignment based on recipe types
  // e.g., breakfast recipes in breakfast slots, etc.

  for (const recipe of sortedRecipes) {
    // Calculate how many servings we need to hit protein target
    const dailyProteinNeeded = Math.max(
      0,
      dailyTargets.protein - currentMacros.protein / daysInWeek
    )

    if (dailyProteinNeeded <= 0) break

    const servingsNeeded = Math.ceil(dailyProteinNeeded / recipe.macros.protein)
    const servingsToAdd = Math.min(servingsNeeded, recipe.availableServings, 3) // Max 3 servings per recipe

    if (servingsToAdd > 0) {
      selectedRecipes.push({
        recipe,
        servings: servingsToAdd,
        day: currentDay % daysInWeek,
        slot: mealSlots[currentSlot % mealSlots.length],
      })

      // Update current macros
      currentMacros.calories += recipe.macros.calories * servingsToAdd
      currentMacros.protein += recipe.macros.protein * servingsToAdd
      currentMacros.carbs += recipe.macros.carbs * servingsToAdd
      currentMacros.fat += recipe.macros.fat * servingsToAdd

      // Move to next meal slot
      currentSlot++
      if (currentSlot % mealSlots.length === 0) {
        currentDay++
      }
    }
  }

  return { selectedRecipes, currentMacros }
}

/**
 * Fill remaining carb and fat targets with complementary recipes
 */
function fillRemainingMacros(
  recipes: RecipeWithMacros[],
  selectedRecipes: Array<{
    recipe: RecipeWithMacros
    servings: number
    day: number
    slot: string
  }>,
  currentMacros: MacroProfile,
  dailyTargets: MacroProfile,
  daysInWeek: number = 7
): Array<{
  recipe: RecipeWithMacros
  servings: number
  day: number
  slot: string
}> {
  const usedRecipeIds = new Set(selectedRecipes.map((s) => s.recipe.id))
  const availableRecipes = recipes.filter(
    (r) => !usedRecipeIds.has(r.id) && r.availableServings > 0
  )

  // TODO: Implement sophisticated carb/fat filling algorithm
  // For now, add simple complementary recipes based on macro gaps

  const dailyCarbGap = Math.max(
    0,
    dailyTargets.carbs - currentMacros.carbs / daysInWeek
  )
  const dailyFatGap = Math.max(
    0,
    dailyTargets.fat - currentMacros.fat / daysInWeek
  )

  // Sort by carb density for carb filling, fat density for fat filling
  const carbRichRecipes = availableRecipes
    .filter((r) => r.macros.carbs > r.macros.fat)
    .sort(
      (a, b) =>
        b.macros.carbs / b.macros.calories - a.macros.carbs / a.macros.calories
    )

  const fatRichRecipes = availableRecipes
    .filter((r) => r.macros.fat > r.macros.carbs)
    .sort(
      (a, b) =>
        b.macros.fat / b.macros.calories - a.macros.fat / a.macros.calories
    )

  const additionalRecipes = [...selectedRecipes]

  // Add carb-rich recipes if needed
  if (dailyCarbGap > 0 && carbRichRecipes.length > 0) {
    const recipe = carbRichRecipes[0]
    const servingsNeeded = Math.min(
      Math.ceil(dailyCarbGap / recipe.macros.carbs),
      recipe.availableServings,
      2
    )

    if (servingsNeeded > 0) {
      additionalRecipes.push({
        recipe,
        servings: servingsNeeded,
        day: Math.floor(Math.random() * daysInWeek),
        slot: 'snack',
      })
    }
  }

  // Add fat-rich recipes if needed
  if (dailyFatGap > 0 && fatRichRecipes.length > 0) {
    const recipe = fatRichRecipes[0]
    const servingsNeeded = Math.min(
      Math.ceil(dailyFatGap / recipe.macros.fat),
      recipe.availableServings,
      2
    )

    if (servingsNeeded > 0) {
      additionalRecipes.push({
        recipe,
        servings: servingsNeeded,
        day: Math.floor(Math.random() * daysInWeek),
        slot: 'snack',
      })
    }
  }

  return additionalRecipes
}

/**
 * Fine-tune servings to hit macro targets within ±5%
 */
function fineTuneMacros(
  selectedRecipes: Array<{
    recipe: RecipeWithMacros
    servings: number
    day: number
    slot: string
  }>,
  dailyTargets: MacroProfile,
  daysInWeek: number = 7
): Array<{
  recipe: RecipeWithMacros
  servings: number
  day: number
  slot: string
}> {
  // Calculate current weekly macros
  const weeklyMacros = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  selectedRecipes.forEach((selection) => {
    weeklyMacros.calories +=
      selection.recipe.macros.calories * selection.servings
    weeklyMacros.protein += selection.recipe.macros.protein * selection.servings
    weeklyMacros.carbs += selection.recipe.macros.carbs * selection.servings
    weeklyMacros.fat += selection.recipe.macros.fat * selection.servings
  })

  const dailyMacros = {
    calories: weeklyMacros.calories / daysInWeek,
    protein: weeklyMacros.protein / daysInWeek,
    carbs: weeklyMacros.carbs / daysInWeek,
    fat: weeklyMacros.fat / daysInWeek,
  }

  // TODO: Implement fine-tuning algorithm that scales servings by ±10g
  // to hit macros within ±5% of targets

  // For now, return as-is with a simple adjustment
  const adjustedRecipes = selectedRecipes.map((selection) => {
    const calorieAccuracy =
      Math.abs(dailyMacros.calories - dailyTargets.calories) /
      dailyTargets.calories

    if (calorieAccuracy > 0.15) {
      // More than 15% off
      // Scale servings slightly
      const scaleFactor = calorieAccuracy > 0.5 ? 0.8 : 0.9
      return {
        ...selection,
        servings: Math.max(1, Math.round(selection.servings * scaleFactor)),
      }
    }

    return selection
  })

  return adjustedRecipes
}

/**
 * Calculate missing ingredients needed for the meal plan
 */
function calculateMissingIngredients(
  selectedRecipes: Array<{
    recipe: RecipeWithMacros
    servings: number
    day: number
    slot: string
  }>,
  pantryItems: PantryItem[]
): Array<{
  ingredientId: string
  ingredientName: string
  neededQuantity: number
  unit: string
  availableQuantity: number
}> {
  const ingredientNeeds = new Map<
    string,
    { needed: number; unit: string; name: string; available: number }
  >()

  // Calculate total ingredient needs
  selectedRecipes.forEach((selection) => {
    selection.recipe.recipe_ingredients.forEach((ingredient) => {
      const totalNeeded = ingredient.quantity * selection.servings
      const key = ingredient.ingredient_id

      if (ingredientNeeds.has(key)) {
        const current = ingredientNeeds.get(key)!
        current.needed += totalNeeded
      } else {
        const pantryItem = pantryItems.find((p) => p.ingredient_id === key)
        ingredientNeeds.set(key, {
          needed: totalNeeded,
          unit: ingredient.unit,
          name: ingredient.ingredients.name,
          available: pantryItem?.quantity || 0,
        })
      }
    })
  })

  // Find missing ingredients
  const missingIngredients: Array<{
    ingredientId: string
    ingredientName: string
    neededQuantity: number
    unit: string
    availableQuantity: number
  }> = []

  ingredientNeeds.forEach((need, ingredientId) => {
    if (need.needed > need.available) {
      missingIngredients.push({
        ingredientId,
        ingredientName: need.name,
        neededQuantity: need.needed - need.available,
        unit: need.unit,
        availableQuantity: need.available,
      })
    }
  })

  return missingIngredients
}

/**
 * Main Macro Tetris Algorithm
 * Generates an optimized weekly meal plan based on user targets and pantry availability
 */
export async function generatePlan(
  userId: string,
  weekStart: Date
): Promise<OptimizationResult> {
  const supabase = await createClient()

  try {
    // 1. Fetch user targets + pantry + recipe pool
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !userProfile) {
      throw new Error('User profile not found')
    }

    const { data: pantryItems, error: pantryError } = await supabase
      .from('pantry_items')
      .select(
        `
        *,
        ingredients (*)
      `
      )
      .eq('user_id', userId)

    if (pantryError) {
      throw new Error('Failed to fetch pantry items')
    }

    const { data: recipes, error: recipesError } = await supabase.from(
      'recipes'
    ).select(`
        *,
        recipe_ingredients (
          *,
          ingredients (*)
        )
      `)

    if (recipesError) {
      throw new Error('Failed to fetch recipes')
    }

    // Calculate daily macro targets
    const dailyTargets: MacroProfile = {
      calories: userProfile.kcal_target,
      protein: Math.round(
        (userProfile.kcal_target * userProfile.protein_pct) / 100 / 4
      ),
      carbs: Math.round(
        (userProfile.kcal_target * userProfile.carb_pct) / 100 / 4
      ),
      fat: Math.round(
        (userProfile.kcal_target * userProfile.fat_pct) / 100 / 9
      ),
    }

    // 2. Process recipes with macro calculations and availability
    const recipesWithMacros: RecipeWithMacros[] = recipes.map((recipe) => {
      const macros = calculateRecipeMacros(recipe)
      const availableServings = calculateAvailableServings(
        recipe,
        pantryItems || []
      )
      const proteinDensity =
        macros.calories > 0 ? (macros.protein / macros.calories) * 100 : 0

      return {
        ...recipe,
        macros,
        proteinDensity,
        availableServings,
      }
    })

    // 3. Greedy fill: protein first
    const { selectedRecipes: proteinFilledRecipes, currentMacros } =
      greedyProteinFill(recipesWithMacros, dailyTargets)

    // 4. Fill remaining carbs/fat
    const filledRecipes = fillRemainingMacros(
      recipesWithMacros,
      proteinFilledRecipes,
      currentMacros,
      dailyTargets
    )

    // 5. Fine-tune servings
    const finalRecipes = fineTuneMacros(filledRecipes, dailyTargets)

    // 6. Calculate missing ingredients
    const missingIngredients = calculateMissingIngredients(
      finalRecipes,
      pantryItems || []
    )

    // 7. Create meal plan in database (replace existing if any)
    const weekStartStr = weekStart.toISOString().split('T')[0]

    // First, delete any existing meal plan and its associated meals
    const { error: deleteError } = await supabase
      .from('meal_plans')
      .delete()
      .eq('user_id', userId)
      .eq('week_start', weekStartStr)

    if (deleteError) {
      console.warn(
        'No existing meal plan to delete or deletion failed:',
        deleteError
      )
    }

    const { data: mealPlan, error: planError } = await supabase
      .from('meal_plans')
      .insert({
        user_id: userId,
        week_start: weekStartStr,
        total_kcal: Math.round(currentMacros.calories),
        total_protein: Math.round(currentMacros.protein),
        total_carbs: Math.round(currentMacros.carbs),
        total_fat: Math.round(currentMacros.fat),
      })
      .select()
      .single()

    if (planError || !mealPlan) {
      console.error('Meal plan creation error:', planError)
      throw new Error(
        `Failed to create meal plan: ${planError?.message || 'Unknown error'}`
      )
    }

    // 8. Create individual meals
    const meals: Meal[] = []
    for (const selection of finalRecipes) {
      const { data: meal, error: mealError } = await supabase
        .from('meals')
        .insert({
          meal_plan_id: mealPlan.id,
          recipe_id: selection.recipe.id,
          servings: selection.servings,
          day_of_week: selection.day,
          meal_slot: selection.slot,
        })
        .select()
        .single()

      if (mealError || !meal) {
        console.error('Failed to create meal:', mealError)
        continue
      }

      meals.push(meal)
    }

    // 9. Calculate final macro accuracy
    const finalMacros = {
      calories:
        finalRecipes.reduce(
          (sum, s) => sum + s.recipe.macros.calories * s.servings,
          0
        ) / 7,
      protein:
        finalRecipes.reduce(
          (sum, s) => sum + s.recipe.macros.protein * s.servings,
          0
        ) / 7,
      carbs:
        finalRecipes.reduce(
          (sum, s) => sum + s.recipe.macros.carbs * s.servings,
          0
        ) / 7,
      fat:
        finalRecipes.reduce(
          (sum, s) => sum + s.recipe.macros.fat * s.servings,
          0
        ) / 7,
    }

    const macroAccuracy = {
      calories: Math.round(
        (1 -
          Math.abs(finalMacros.calories - dailyTargets.calories) /
            dailyTargets.calories) *
          100
      ),
      protein: Math.round(
        (1 -
          Math.abs(finalMacros.protein - dailyTargets.protein) /
            dailyTargets.protein) *
          100
      ),
      carbs: Math.round(
        (1 -
          Math.abs(finalMacros.carbs - dailyTargets.carbs) /
            dailyTargets.carbs) *
          100
      ),
      fat: Math.round(
        (1 - Math.abs(finalMacros.fat - dailyTargets.fat) / dailyTargets.fat) *
          100
      ),
    }

    return {
      mealPlan,
      meals,
      missingIngredients,
      macroAccuracy,
    }
  } catch (error) {
    console.error('Macro Tetris algorithm failed:', error)
    throw error
  }
}

/**
 * TODO: Advanced features for future milestones
 *
 * 1. LLM Recipe Remix:
 *    - Use AI to modify recipes based on available ingredients
 *    - Generate ingredient substitutions
 *    - Create new recipe variations
 *
 * 2. Swipe Taste Learning:
 *    - Track user preferences through swipe interactions
 *    - Build taste profile using collaborative filtering
 *    - Prioritize recipes based on learned preferences
 *
 * 3. Advanced Optimization:
 *    - Implement genetic algorithm for meal plan optimization
 *    - Consider cook time, difficulty, and variety constraints
 *    - Optimize for minimal food waste
 *
 * 4. Seasonal and Cost Optimization:
 *    - Factor in seasonal ingredient availability
 *    - Optimize for budget constraints
 *    - Consider ingredient shelf life
 */
