/**
 * AI-Powered Recipe Adaptation System
 * 
 * This service uses Kimi K2 to intelligently modify recipes based on:
 * - Available pantry ingredients
 * - Macro targets and dietary restrictions
 * - User preferences and cooking skill level
 * - Ingredient substitutions and scaling
 */

import { kimiClient } from './kimi-client'
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

interface AdaptationRequest {
  type: 'macro_optimize' | 'ingredient_substitute' | 'dietary_convert' | 'portion_scale'
  targetMacros?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  missingIngredients?: string[]
  availableIngredients?: string[]
  dietaryRestrictions?: string[] // ['keto', 'vegan', 'gluten-free', etc.]
  portionScale?: number // 0.5 for half, 2.0 for double, etc.
  preferences?: string[] // ['low-sodium', 'high-protein', etc.]
}

interface AdaptedRecipe {
  originalRecipeId: string
  name: string
  steps: Array<{ order: number; text: string; time_s: number }>
  ingredients: Array<{ name: string; quantity: number; unit: string }>
  macros: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  modifications: string
  confidence: number // AI confidence score 0-1
}

class RecipeAdapter {

  /**
   * Adapt a recipe based on the given parameters
   */
  async adaptRecipe(
    originalRecipe: Recipe,
    adaptationRequest: AdaptationRequest
  ): Promise<AdaptedRecipe> {
    try {
      // Generate adaptation prompt based on request type
      const adaptationPrompt = this.generateAdaptationPrompt(adaptationRequest)
      
      // Call Kimi K2 for recipe adaptation
      const messages = kimiClient.createRecipeAdaptationPrompt(
        originalRecipe,
        adaptationPrompt,
        adaptationRequest.targetMacros,
        adaptationRequest.availableIngredients
      )

      const response = await kimiClient.chat(messages, {
        temperature: 0.7,
        max_tokens: 2048
      })

      // Parse and validate the AI response
      const adaptedRecipe = this.parseAdaptationResponse(response, originalRecipe.id)
      
      // Validate macro calculations
      const validatedRecipe = await this.validateAndAdjustMacros(adaptedRecipe, adaptationRequest.targetMacros)
      
      return validatedRecipe
    } catch (error) {
      console.error('Recipe adaptation failed:', error)
      throw new Error(`Failed to adapt recipe: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Adapt multiple recipes for a meal plan optimization
   */
  async adaptRecipesForMealPlan(
    recipes: Recipe[],
    pantryItems: PantryItem[],
    weeklyMacroTargets: { calories: number; protein: number; carbs: number; fat: number },
    preferences?: string[]
  ): Promise<AdaptedRecipe[]> {
    const adaptedRecipes: AdaptedRecipe[] = []
    
    // Calculate daily macro targets
    const dailyTargets = {
      calories: Math.round(weeklyMacroTargets.calories / 7),
      protein: Math.round(weeklyMacroTargets.protein / 7),
      carbs: Math.round(weeklyMacroTargets.carbs / 7),
      fat: Math.round(weeklyMacroTargets.fat / 7)
    }

    // Get available ingredients from pantry
    const availableIngredients = pantryItems.map(item => item.ingredients.name)
    
    for (const recipe of recipes) {
      try {
        // Check what ingredients are missing for this recipe
        const missingIngredients = this.findMissingIngredients(recipe, pantryItems)
        
        // Create adaptation request based on missing ingredients and targets
        const adaptationRequest: AdaptationRequest = {
          type: missingIngredients.length > 0 ? 'ingredient_substitute' : 'macro_optimize',
          targetMacros: dailyTargets,
          missingIngredients: missingIngredients,
          availableIngredients: availableIngredients,
          preferences: preferences
        }

        const adaptedRecipe = await this.adaptRecipe(recipe, adaptationRequest)
        adaptedRecipes.push(adaptedRecipe)
      } catch (error) {
        console.error(`Failed to adapt recipe ${recipe.name}:`, error)
        // Skip failed adaptations and continue
      }
    }

    return adaptedRecipes
  }

  /**
   * Generate substitution suggestions for missing ingredients
   */
  async suggestIngredientSubstitutions(
    missingIngredient: string,
    availableIngredients: string[],
    recipeContext: string
  ): Promise<string[]> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a culinary expert. Suggest 3-5 ingredient substitutions that maintain flavor and nutritional profile. Respond with a JSON array of strings.`
      },
      {
        role: 'user' as const,
        content: `Missing ingredient: ${missingIngredient}
Available ingredients: ${availableIngredients.join(', ')}
Recipe context: ${recipeContext}

Suggest substitutions that work well in this recipe context.`
      }
    ]

    try {
      const response = await kimiClient.chat(messages, { temperature: 0.8 })
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to generate substitutions:', error)
      return []
    }
  }

  /**
   * Store adapted recipe variation in database
   */
  async saveRecipeVariation(adaptedRecipe: AdaptedRecipe, userId: string): Promise<string | null> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('recipe_variations')
        .insert({
          base_recipe_id: adaptedRecipe.originalRecipeId,
          user_id: userId,
          variation_prompt: adaptedRecipe.modifications,
          modified_ingredients: adaptedRecipe.ingredients,
          modified_instructions: adaptedRecipe.steps,
          confidence_score: adaptedRecipe.confidence
        })
        .select('id')
        .single()

      if (error) throw error
      return data?.id || null
    } catch (error) {
      console.error('Failed to save recipe variation:', error)
      return null
    }
  }

  private generateAdaptationPrompt(request: AdaptationRequest): string {
    switch (request.type) {
      case 'macro_optimize':
        return `Optimize this recipe to better match the target macro ratios while maintaining flavor and cooking feasibility.`
      
      case 'ingredient_substitute':
        return `Replace unavailable ingredients with suitable alternatives from the available ingredients list. Maintain nutritional balance and flavor profile.`
      
      case 'dietary_convert':
        return `Convert this recipe to be ${request.dietaryRestrictions?.join(' and ')} compliant while preserving taste and nutritional value.`
      
      case 'portion_scale':
        return `Scale this recipe by ${request.portionScale}x while maintaining proper cooking ratios and timing.`
      
      default:
        return 'Optimize this recipe for better nutritional balance and ingredient availability.'
    }
  }

  private parseAdaptationResponse(response: string, originalRecipeId: string): AdaptedRecipe {
    try {
      const parsed = JSON.parse(response)
      
      return {
        originalRecipeId,
        name: parsed.name || 'Adapted Recipe',
        steps: parsed.steps || [],
        ingredients: parsed.ingredients || [],
        macros: parsed.macros || { calories: 0, protein: 0, carbs: 0, fat: 0 },
        modifications: parsed.modifications || 'AI-generated adaptation',
        confidence: this.calculateConfidenceScore(parsed)
      }
    } catch (error) {
      console.error('Failed to parse adaptation response:', error)
      throw new Error('Invalid response format from AI')
    }
  }

  private async validateAndAdjustMacros(
    adaptedRecipe: AdaptedRecipe,
    targetMacros?: { calories: number; protein: number; carbs: number; fat: number }
  ): Promise<AdaptedRecipe> {
    if (!targetMacros) return adaptedRecipe

    // Calculate accuracy of macro targets
    const calorieAccuracy = Math.abs(adaptedRecipe.macros.calories - targetMacros.calories) / targetMacros.calories
    const proteinAccuracy = Math.abs(adaptedRecipe.macros.protein - targetMacros.protein) / targetMacros.protein
    
    // If accuracy is poor (>20% off), reduce confidence score
    if (calorieAccuracy > 0.2 || proteinAccuracy > 0.2) {
      adaptedRecipe.confidence *= 0.7
      adaptedRecipe.modifications += ' Note: Macro targets may need manual adjustment.'
    }

    return adaptedRecipe
  }

  private findMissingIngredients(recipe: Recipe, pantryItems: PantryItem[]): string[] {
    const missingIngredients: string[] = []
    
    recipe.recipe_ingredients.forEach(recipeIngredient => {
      const pantryItem = pantryItems.find(p => p.ingredient_id === recipeIngredient.ingredient_id)
      
      if (!pantryItem || pantryItem.quantity < recipeIngredient.quantity) {
        missingIngredients.push(recipeIngredient.ingredients.name)
      }
    })

    return missingIngredients
  }

  private calculateConfidenceScore(parsed: any): number {
    let score = 1.0
    
    // Reduce confidence based on missing or incomplete data
    if (!parsed.macros || Object.keys(parsed.macros).length < 4) score *= 0.8
    if (!parsed.steps || parsed.steps.length === 0) score *= 0.7
    if (!parsed.ingredients || parsed.ingredients.length === 0) score *= 0.6
    
    return Math.max(0.1, score) // Minimum confidence of 0.1
  }
}

export const recipeAdapter = new RecipeAdapter()
export type { AdaptationRequest, AdaptedRecipe }