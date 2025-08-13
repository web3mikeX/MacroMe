export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          kcal_target: number
          protein_pct: number
          carb_pct: number
          fat_pct: number
        }
        Insert: {
          id: string
          email: string
          kcal_target?: number
          protein_pct?: number
          carb_pct?: number
          fat_pct?: number
        }
        Update: {
          id?: string
          email?: string
          kcal_target?: number
          protein_pct?: number
          carb_pct?: number
          fat_pct?: number
        }
      }
      ingredients: {
        Row: {
          id: string
          name: string
          unit: string
          protein: number
          carbs: number
          fat: number
          kcal: number
        }
        Insert: {
          id?: string
          name: string
          unit: string
          protein: number
          carbs: number
          fat: number
          kcal: number
        }
        Update: {
          id?: string
          name?: string
          unit?: string
          protein?: number
          carbs?: number
          fat?: number
          kcal?: number
        }
      }
      pantry_items: {
        Row: {
          user_id: string
          ingredient_id: string
          quantity: number
          unit: string
        }
        Insert: {
          user_id: string
          ingredient_id: string
          quantity: number
          unit: string
        }
        Update: {
          user_id?: string
          ingredient_id?: string
          quantity?: number
          unit?: string
        }
      }
      recipes: {
        Row: {
          id: string
          name: string
          steps: Array<{
            order: number
            text: string
            time_s?: number
            gif_url?: string
          }>
          skill_level: string
          default_servings: number
        }
        Insert: {
          id?: string
          name: string
          steps: Array<{
            order: number
            text: string
            time_s?: number
            gif_url?: string
          }>
          skill_level: string
          default_servings: number
        }
        Update: {
          id?: string
          name?: string
          steps?: Array<{
            order: number
            text: string
            time_s?: number
            gif_url?: string
          }>
          skill_level?: string
          default_servings?: number
        }
      }
      recipe_ingredients: {
        Row: {
          recipe_id: string
          ingredient_id: string
          quantity: number
          unit: string
        }
        Insert: {
          recipe_id: string
          ingredient_id: string
          quantity: number
          unit: string
        }
        Update: {
          recipe_id?: string
          ingredient_id?: string
          quantity?: number
          unit?: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          week_start: string
          total_kcal: number
          total_protein: number
          total_carbs: number
          total_fat: number
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          total_kcal: number
          total_protein: number
          total_carbs: number
          total_fat: number
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          total_kcal?: number
          total_protein?: number
          total_carbs?: number
          total_fat?: number
        }
      }
      meals: {
        Row: {
          id: string
          meal_plan_id: string
          recipe_id: string
          servings: number
          day_of_week: number
          meal_slot: string
        }
        Insert: {
          id?: string
          meal_plan_id: string
          recipe_id: string
          servings: number
          day_of_week: number
          meal_slot: string
        }
        Update: {
          id?: string
          meal_plan_id?: string
          recipe_id?: string
          servings?: number
          day_of_week?: number
          meal_slot?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}