import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recipeAdapter } from '@/lib/ai/recipe-adapter'
import { kimiClient } from '@/lib/ai/kimi-client'
import { generatePlan } from '@/lib/macroTetris'

interface AIMealPlanRequest {
  userId: string
  weekStart: string
  preferences?: {
    cuisineTypes?: string[]
    dietaryRestrictions?: string[]
    spiceLevel?: 'mild' | 'medium' | 'spicy'
    cookingTime?: 'quick' | 'moderate' | 'elaborate'
    budget?: 'low' | 'medium' | 'high'
  }
  aiEnhancements?: {
    adaptRecipes?: boolean
    generateSuggestions?: boolean
    optimizePantry?: boolean
    smartSubstitutions?: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      weekStart,
      preferences = {},
      aiEnhancements = {
        adaptRecipes: true,
        generateSuggestions: true,
        optimizePantry: true,
        smartSubstitutions: true,
      },
    }: AIMealPlanRequest = await request.json()

    if (!userId || !weekStart) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify user authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user profile and preferences
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // Temporarily handle missing AI tables gracefully
    // Get user AI preferences if available
    try {
      await supabase.from('user_preferences').select('*').eq('user_id', userId)
    } catch (error) {
      console.log('AI preferences table not yet available:', error)
    }

    const { data: pantryItems } = await supabase
      .from('pantry_items')
      .select(
        `
        *,
        ingredients (*)
      `
      )
      .eq('user_id', userId)

    const { data: recipes } = await supabase.from('recipes').select(`
        *,
        recipe_ingredients (
          *,
          ingredients (*)
        )
      `)

    if (!userProfile || !recipes) {
      return NextResponse.json(
        { error: 'Failed to fetch required data' },
        { status: 500 }
      )
    }

    // Phase 1: Generate base meal plan using existing Macro Tetris
    console.log('🎯 Generating base meal plan with Macro Tetris...')
    const basePlan = await generatePlan(userId, new Date(weekStart))

    const enhancedPlan = basePlan
    let aiSuggestions: unknown[] = []
    let adaptedRecipes: unknown[] = []

    // Phase 2: AI Enhancements
    if (aiEnhancements.adaptRecipes || aiEnhancements.generateSuggestions) {
      console.log('🤖 Enhancing with AI capabilities...')

      // Calculate weekly macro targets
      const weeklyTargets = {
        calories: userProfile.kcal_target * 7,
        protein:
          Math.round(
            (userProfile.kcal_target * userProfile.protein_pct) / 100 / 4
          ) * 7,
        carbs:
          Math.round(
            (userProfile.kcal_target * userProfile.carb_pct) / 100 / 4
          ) * 7,
        fat:
          Math.round(
            (userProfile.kcal_target * userProfile.fat_pct) / 100 / 9
          ) * 7,
      }

      // Get available pantry ingredients
      const availableIngredients =
        pantryItems?.map((item) => item.ingredients.name) || []

      if (
        aiEnhancements.adaptRecipes &&
        basePlan.missingIngredients.length > 0
      ) {
        console.log('🔧 Adapting recipes for missing ingredients...')

        try {
          // Find recipes that need adaptation
          const recipesToAdapt = recipes.filter((recipe) =>
            basePlan.meals.some((meal) => meal.recipe_id === recipe.id)
          )

          adaptedRecipes = await recipeAdapter.adaptRecipesForMealPlan(
            recipesToAdapt.slice(0, 3), // Limit to 3 recipes for performance
            pantryItems || [],
            weeklyTargets,
            Object.values(preferences).flat()
          )

          console.log(
            `✅ Successfully adapted ${adaptedRecipes.length} recipes`
          )
        } catch (error) {
          console.error('❌ Recipe adaptation failed:', error)
        }
      }

      if (aiEnhancements.generateSuggestions) {
        console.log('💡 Generating AI meal suggestions...')

        try {
          // Generate meal suggestions based on pantry and preferences
          const dailyTargets = {
            calories: Math.round(weeklyTargets.calories / 7),
            protein: Math.round(weeklyTargets.protein / 7),
            carbs: Math.round(weeklyTargets.carbs / 7),
            fat: Math.round(weeklyTargets.fat / 7),
          }

          aiSuggestions = await kimiClient.generateMealSuggestions(
            availableIngredients,
            dailyTargets,
            preferences.cuisineTypes,
            preferences.dietaryRestrictions
          )

          // Store AI suggestions in database (if table exists)
          if (aiSuggestions.length > 0) {
            try {
              await supabase.from('ai_meal_suggestions').insert({
                user_id: userId,
                suggestion_type: 'pantry_based',
                suggested_recipes: aiSuggestions,
                reasoning:
                  'Generated based on available pantry items and macro targets',
                macro_targets: dailyTargets,
                confidence_score: 0.8,
              })
            } catch (error) {
              console.log(
                'AI suggestions table not yet available, skipping storage:',
                error
              )
            }
          }

          console.log(
            `✅ Generated ${aiSuggestions.length} AI meal suggestions`
          )
        } catch (error) {
          console.error('❌ AI suggestion generation failed:', error)
        }
      }
    }

    // Phase 3: Smart Shopping List with AI
    let smartShoppingList = null
    if (
      aiEnhancements.optimizePantry &&
      basePlan.missingIngredients.length > 0
    ) {
      console.log('🛒 Generating smart shopping list...')

      try {
        smartShoppingList = await kimiClient.generateShoppingList(
          basePlan.missingIngredients.map((item) => ({
            name: item.ingredientName,
            quantity: item.neededQuantity,
            unit: item.unit,
          })),
          {
            budget: preferences.budget,
            dietary: preferences.dietaryRestrictions,
          }
        )

        console.log('✅ Smart shopping list generated')
      } catch (error) {
        console.error('❌ Smart shopping list generation failed:', error)
      }
    }

    // Phase 4: Track interaction for learning (if function exists)
    try {
      await supabase.rpc('track_user_interaction', {
        p_user_id: userId,
        p_interaction_type: 'meal_plan_generate',
        p_entity_type: 'meal_plan',
        p_entity_id: basePlan.mealPlan.id,
        p_metadata: {
          ai_enhancements_used: aiEnhancements,
          preferences_applied: preferences,
          adapted_recipes_count: adaptedRecipes.length,
          ai_suggestions_count: aiSuggestions.length,
        },
      })
    } catch (error) {
      console.log('AI tracking function not yet available, skipping:', error)
    }

    // Return enhanced meal plan
    const response = {
      ...enhancedPlan,
      aiEnhancements: {
        adaptedRecipes: adaptedRecipes,
        aiSuggestions: aiSuggestions,
        smartShoppingList: smartShoppingList,
        enhancementsApplied: aiEnhancements,
      },
      metadata: {
        processingTime: Date.now(),
        aiConfidence:
          adaptedRecipes.length > 0
            ? adaptedRecipes.reduce((sum, r) => sum + r.confidence, 0) /
              adaptedRecipes.length
            : null,
      },
    }

    console.log('🎉 AI-enhanced meal plan generation completed successfully')
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ AI meal plan generation failed:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve AI suggestions for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const suggestionType = searchParams.get('type') || 'all'

  if (!userId) {
    return NextResponse.json(
      { error: 'userId parameter is required' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch AI suggestions (if table exists)
    try {
      let query = supabase
        .from('ai_meal_suggestions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (suggestionType !== 'all') {
        query = query.eq('suggestion_type', suggestionType)
      }

      const { data: suggestions, error } = await query

      if (error) throw error

      return NextResponse.json({ suggestions: suggestions || [] })
    } catch (error) {
      console.log('AI suggestions table not yet available:', error)
      return NextResponse.json({ suggestions: [] })
    }
  } catch (error) {
    console.error('Failed to fetch AI suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
