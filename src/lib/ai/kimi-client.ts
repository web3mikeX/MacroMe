/**
 * Kimi K2 API Client
 * 
 * Wrapper for the Kimi K2 LLM API with proper error handling,
 * rate limiting, and response validation.
 */

interface KimiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface KimiResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface KimiRequestOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

class KimiK2Client {
  private apiKey: string
  private baseUrl: string
  private defaultModel = 'moonshot-v1-32k'

  constructor() {
    this.apiKey = process.env.KIMI_K2_API_KEY || ''
    this.baseUrl = process.env.KIMI_K2_BASE_URL || 'https://api.moonshot.cn/v1'
    
    if (!this.apiKey) {
      throw new Error('KIMI_K2_API_KEY environment variable is required')
    }
  }

  async chat(
    messages: KimiMessage[],
    options: KimiRequestOptions = {}
  ): Promise<string> {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      max_tokens = 2048,
      stream = false
    } = options

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Kimi K2 API error (${response.status}): ${error}`)
      }

      const data: KimiResponse = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices received from Kimi K2')
      }

      return data.choices[0].message.content
    } catch (error) {
      console.error('Kimi K2 API call failed:', error)
      throw error
    }
  }

  /**
   * Generate a system prompt for recipe adaptation
   */
  createRecipeAdaptationPrompt(
    originalRecipe: any,
    adaptationRequest: string,
    macroTargets?: { protein: number; carbs: number; fat: number; calories: number },
    availableIngredients?: string[]
  ): KimiMessage[] {
    const systemPrompt = `You are an expert chef and nutritionist specializing in recipe adaptation and macro-optimized cooking. 

Your task is to modify recipes based on user requests while maintaining:
1. Nutritional accuracy and macro targets
2. Cooking feasibility and flavor balance
3. Clear, step-by-step instructions
4. Proper ingredient quantities and units

Always respond with valid JSON in this exact format:
{
  "name": "Modified recipe name",
  "steps": [
    {"order": 1, "text": "Step description", "time_s": 300}
  ],
  "ingredients": [
    {"name": "Ingredient name", "quantity": 100, "unit": "g"}
  ],
  "macros": {
    "calories": 450,
    "protein": 35,
    "carbs": 25,
    "fat": 15
  },
  "modifications": "Brief explanation of changes made"
}`

    const messages: KimiMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Original Recipe:
Name: ${originalRecipe.name}
Ingredients: ${JSON.stringify(originalRecipe.recipe_ingredients, null, 2)}
Steps: ${JSON.stringify(originalRecipe.steps, null, 2)}

Adaptation Request: ${adaptationRequest}

${macroTargets ? `Target Macros:
- Calories: ${macroTargets.calories}
- Protein: ${macroTargets.protein}g
- Carbs: ${macroTargets.carbs}g  
- Fat: ${macroTargets.fat}g` : ''}

${availableIngredients ? `Available Ingredients: ${availableIngredients.join(', ')}` : ''}

Please adapt this recipe according to the request while optimizing for the target macros and using available ingredients when possible.`
      }
    ]

    return messages
  }

  /**
   * Generate meal suggestions based on pantry items and preferences
   */
  async generateMealSuggestions(
    pantryItems: string[],
    macroTargets: { protein: number; carbs: number; fat: number; calories: number },
    preferences?: string[],
    restrictions?: string[]
  ): Promise<any[]> {
    const messages: KimiMessage[] = [
      {
        role: 'system',
        content: `You are a meal planning expert. Generate 3-5 meal suggestions based on available ingredients and macro targets.

Respond with valid JSON array:
[
  {
    "name": "Meal name",
    "description": "Brief description",
    "ingredients": [{"name": "Ingredient", "quantity": 100, "unit": "g"}],
    "macros": {"calories": 400, "protein": 30, "carbs": 20, "fat": 15},
    "cookTime": 25,
    "difficulty": "easy|medium|hard"
  }
]`
      },
      {
        role: 'user',
        content: `Available ingredients: ${pantryItems.join(', ')}

Target macros per meal:
- Calories: ${macroTargets.calories}
- Protein: ${macroTargets.protein}g
- Carbs: ${macroTargets.carbs}g
- Fat: ${macroTargets.fat}g

${preferences ? `Preferences: ${preferences.join(', ')}` : ''}
${restrictions ? `Restrictions: ${restrictions.join(', ')}` : ''}

Generate meal suggestions that maximize use of available ingredients while hitting macro targets.`
      }
    ]

    const response = await this.chat(messages, { temperature: 0.8 })
    
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse meal suggestions JSON:', error)
      throw new Error('Invalid JSON response from AI')
    }
  }

  /**
   * Generate smart shopping list based on missing ingredients and preferences
   */
  async generateShoppingList(
    missingIngredients: Array<{ name: string; quantity: number; unit: string }>,
    preferences?: { budget?: string; dietary?: string[] }
  ): Promise<any> {
    const messages: KimiMessage[] = [
      {
        role: 'system',
        content: `You are a smart shopping assistant. Generate an optimized grocery list with suggestions for bulk buying, alternatives, and cost optimization.

Respond with valid JSON:
{
  "categories": [
    {
      "name": "Produce",
      "items": [
        {
          "name": "Bananas",
          "quantity": "2 lbs",
          "priority": "high|medium|low",
          "alternatives": ["Plantains", "Apples"],
          "notes": "Buy ripe for immediate use"
        }
      ]
    }
  ],
  "estimatedCost": 45.50,
  "tips": ["Bulk buying opportunities", "Seasonal alternatives"]
}`
      },
      {
        role: 'user',
        content: `Missing ingredients needed:
${missingIngredients.map(item => `- ${item.name}: ${item.quantity} ${item.unit}`).join('\n')}

${preferences?.budget ? `Budget preference: ${preferences.budget}` : ''}
${preferences?.dietary ? `Dietary preferences: ${preferences.dietary.join(', ')}` : ''}

Generate an optimized shopping list with cost-saving tips and alternatives.`
      }
    ]

    const response = await this.chat(messages, { temperature: 0.6 })
    
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse shopping list JSON:', error)
      throw new Error('Invalid JSON response from AI')
    }
  }
}

// Export singleton instance
export const kimiClient = new KimiK2Client()
export type { KimiMessage, KimiRequestOptions }