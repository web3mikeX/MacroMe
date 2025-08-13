/**
 * Comprehensive Seed Script for MealPrep Pro
 * 
 * This script populates the database with:
 * - 10 sample ingredients with nutrition data
 * - 6 simple recipes with calculated macros
 * - 1 demo user with pre-stocked pantry
 * 
 * Usage: npm run seed
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../src/lib/types/database'

// Environment variables for Supabase connection
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY! // Service key for admin operations

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_KEY')
  process.exit(1)
}

// Initialize Supabase client with service key for admin operations
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Sample ingredients with comprehensive nutrition data
const SAMPLE_INGREDIENTS = [
  {
    name: 'Chicken Breast (Skinless)',
    unit: 'g',
    protein: 31.0,
    carbs: 0.0,
    fat: 3.6,
    kcal: 165
  },
  {
    name: 'Brown Rice (Dry)',
    unit: 'g',
    protein: 7.9,
    carbs: 77.2,
    fat: 2.9,
    kcal: 370
  },
  {
    name: 'Broccoli (Fresh)',
    unit: 'g',
    protein: 2.8,
    carbs: 7.0,
    fat: 0.4,
    kcal: 34
  },
  {
    name: 'Extra Virgin Olive Oil',
    unit: 'ml',
    protein: 0.0,
    carbs: 0.0,
    fat: 100.0,
    kcal: 884
  },
  {
    name: 'Sweet Potato (Raw)',
    unit: 'g',
    protein: 2.0,
    carbs: 20.1,
    fat: 0.1,
    kcal: 86
  },
  {
    name: 'Salmon Fillet (Atlantic)',
    unit: 'g',
    protein: 25.4,
    carbs: 0.0,
    fat: 13.4,
    kcal: 208
  },
  {
    name: 'Quinoa (Dry)',
    unit: 'g',
    protein: 14.1,
    carbs: 64.2,
    fat: 6.1,
    kcal: 368
  },
  {
    name: 'Baby Spinach (Fresh)',
    unit: 'g',
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    kcal: 23
  },
  {
    name: 'Greek Yogurt (Plain, 0% Fat)',
    unit: 'g',
    protein: 10.0,
    carbs: 3.6,
    fat: 0.4,
    kcal: 59
  },
  {
    name: 'Avocado (Fresh)',
    unit: 'g',
    protein: 2.0,
    carbs: 8.5,
    fat: 14.7,
    kcal: 160
  }
] as const

// Sample recipes with detailed cooking steps
const SAMPLE_RECIPES = [
  {
    name: 'Grilled Chicken with Sweet Potato and Broccoli',
    skill_level: 'beginner' as const,
    default_servings: 1,
    steps: [
      { order: 1, text: 'Preheat grill or grill pan to medium-high heat', time_s: 300 },
      { order: 2, text: 'Season chicken breast with salt, pepper, and herbs', time_s: 120 },
      { order: 3, text: 'Wash and cube sweet potato into 1-inch pieces', time_s: 180 },
      { order: 4, text: 'Place sweet potato cubes in microwave-safe dish with 2 tbsp water', time_s: 60 },
      { order: 5, text: 'Microwave sweet potato on high for 5-6 minutes until tender', time_s: 360 },
      { order: 6, text: 'Cut broccoli into florets and steam for 4-5 minutes', time_s: 300 },
      { order: 7, text: 'Grill chicken breast for 6-7 minutes per side until internal temp reaches 165°F', time_s: 840 },
      { order: 8, text: 'Let chicken rest for 5 minutes, then slice', time_s: 300 },
      { order: 9, text: 'Drizzle vegetables with olive oil and serve with chicken', time_s: 60 }
    ],
    ingredients: [
      { name: 'Chicken Breast (Skinless)', quantity: 150, unit: 'g' },
      { name: 'Sweet Potato (Raw)', quantity: 200, unit: 'g' },
      { name: 'Broccoli (Fresh)', quantity: 150, unit: 'g' },
      { name: 'Extra Virgin Olive Oil', quantity: 10, unit: 'ml' }
    ]
  },
  {
    name: 'Honey Garlic Salmon with Quinoa',
    skill_level: 'intermediate' as const,
    default_servings: 1,
    steps: [
      { order: 1, text: 'Rinse quinoa in fine mesh strainer until water runs clear', time_s: 120 },
      { order: 2, text: 'Cook quinoa: 1 cup quinoa to 2 cups water, bring to boil then simmer covered for 15 minutes', time_s: 900 },
      { order: 3, text: 'Mix honey, minced garlic, soy sauce, and ginger for marinade', time_s: 180 },
      { order: 4, text: 'Marinate salmon fillets for 15 minutes (or longer)', time_s: 900 },
      { order: 5, text: 'Heat olive oil in a pan over medium-high heat', time_s: 120 },
      { order: 6, text: 'Cook salmon skin-side up for 4 minutes without moving', time_s: 240 },
      { order: 7, text: 'Flip salmon and cook for another 3-4 minutes until flaky', time_s: 210 },
      { order: 8, text: 'Fluff quinoa with a fork and serve with salmon', time_s: 120 }
    ],
    ingredients: [
      { name: 'Salmon Fillet (Atlantic)', quantity: 150, unit: 'g' },
      { name: 'Quinoa (Dry)', quantity: 80, unit: 'g' },
      { name: 'Extra Virgin Olive Oil', quantity: 10, unit: 'ml' }
    ]
  },
  {
    name: 'Greek Yogurt Power Bowl',
    skill_level: 'beginner' as const,
    default_servings: 1,
    steps: [
      { order: 1, text: 'Place Greek yogurt in a bowl', time_s: 30 },
      { order: 2, text: 'Wash and slice avocado into thin slices', time_s: 120 },
      { order: 3, text: 'Rinse baby spinach and add to bowl', time_s: 60 },
      { order: 4, text: 'Arrange avocado slices on top', time_s: 60 },
      { order: 5, text: 'Drizzle with olive oil and season with salt and pepper', time_s: 30 }
    ],
    ingredients: [
      { name: 'Greek Yogurt (Plain, 0% Fat)', quantity: 200, unit: 'g' },
      { name: 'Avocado (Fresh)', quantity: 100, unit: 'g' },
      { name: 'Baby Spinach (Fresh)', quantity: 50, unit: 'g' },
      { name: 'Extra Virgin Olive Oil', quantity: 5, unit: 'ml' }
    ]
  },
  {
    name: 'Simple Brown Rice and Veggie Bowl',
    skill_level: 'beginner' as const,
    default_servings: 1,
    steps: [
      { order: 1, text: 'Rinse brown rice until water runs clear', time_s: 120 },
      { order: 2, text: 'Cook brown rice: 1 cup rice to 2.5 cups water, bring to boil then simmer covered for 45 minutes', time_s: 2700 },
      { order: 3, text: 'Steam broccoli florets for 4-5 minutes until tender-crisp', time_s: 300 },
      { order: 4, text: 'Sauté baby spinach with a little olive oil for 2 minutes', time_s: 120 },
      { order: 5, text: 'Fluff rice with fork and serve topped with vegetables', time_s: 120 }
    ],
    ingredients: [
      { name: 'Brown Rice (Dry)', quantity: 80, unit: 'g' },
      { name: 'Broccoli (Fresh)', quantity: 150, unit: 'g' },
      { name: 'Baby Spinach (Fresh)', quantity: 100, unit: 'g' },
      { name: 'Extra Virgin Olive Oil', quantity: 10, unit: 'ml' }
    ]
  },
  {
    name: 'Quinoa Spinach Power Salad',
    skill_level: 'beginner' as const,
    default_servings: 1,
    steps: [
      { order: 1, text: 'Cook quinoa according to package directions and let cool', time_s: 1200 },
      { order: 2, text: 'Wash and dry baby spinach thoroughly', time_s: 180 },
      { order: 3, text: 'Dice avocado into small cubes', time_s: 120 },
      { order: 4, text: 'Combine quinoa, spinach, and avocado in a large bowl', time_s: 60 },
      { order: 5, text: 'Whisk olive oil with lemon juice for simple dressing', time_s: 60 },
      { order: 6, text: 'Toss salad with dressing and serve immediately', time_s: 60 }
    ],
    ingredients: [
      { name: 'Quinoa (Dry)', quantity: 60, unit: 'g' },
      { name: 'Baby Spinach (Fresh)', quantity: 150, unit: 'g' },
      { name: 'Avocado (Fresh)', quantity: 100, unit: 'g' },
      { name: 'Extra Virgin Olive Oil', quantity: 15, unit: 'ml' }
    ]
  },
  {
    name: 'Baked Chicken with Sweet Potato Mash',
    skill_level: 'intermediate' as const,
    default_servings: 1,
    steps: [
      { order: 1, text: 'Preheat oven to 375°F (190°C)', time_s: 300 },
      { order: 2, text: 'Season chicken breast with herbs and place in baking dish', time_s: 180 },
      { order: 3, text: 'Peel and cube sweet potatoes', time_s: 300 },
      { order: 4, text: 'Boil sweet potato cubes for 15-20 minutes until tender', time_s: 1200 },
      { order: 5, text: 'Bake chicken for 25-30 minutes until internal temp reaches 165°F', time_s: 1800 },
      { order: 6, text: 'Drain sweet potatoes and mash with a little olive oil', time_s: 180 },
      { order: 7, text: 'Steam broccoli for the last 5 minutes of chicken cooking time', time_s: 300 },
      { order: 8, text: 'Let chicken rest 5 minutes before serving with mashed sweet potato and broccoli', time_s: 300 }
    ],
    ingredients: [
      { name: 'Chicken Breast (Skinless)', quantity: 150, unit: 'g' },
      { name: 'Sweet Potato (Raw)', quantity: 250, unit: 'g' },
      { name: 'Broccoli (Fresh)', quantity: 100, unit: 'g' },
      { name: 'Extra Virgin Olive Oil', quantity: 10, unit: 'ml' }
    ]
  }
] as const

// Demo user configuration
const DEMO_USER = {
  email: 'demo@mealprep.pro',
  password: 'MealPrep2024!',
  profile: {
    kcal_target: 2000,
    protein_pct: 30,
    carb_pct: 40,
    fat_pct: 30
  }
}

// Demo user's pantry stock
const DEMO_PANTRY = [
  { ingredient: 'Chicken Breast (Skinless)', quantity: 1000, unit: 'g' },
  { ingredient: 'Brown Rice (Dry)', quantity: 500, unit: 'g' },
  { ingredient: 'Broccoli (Fresh)', quantity: 800, unit: 'g' },
  { ingredient: 'Extra Virgin Olive Oil', quantity: 500, unit: 'ml' },
  { ingredient: 'Sweet Potato (Raw)', quantity: 1200, unit: 'g' },
  { ingredient: 'Salmon Fillet (Atlantic)', quantity: 600, unit: 'g' },
  { ingredient: 'Quinoa (Dry)', quantity: 400, unit: 'g' },
  { ingredient: 'Baby Spinach (Fresh)', quantity: 300, unit: 'g' },
  { ingredient: 'Greek Yogurt (Plain, 0% Fat)', quantity: 1000, unit: 'g' },
  { ingredient: 'Avocado (Fresh)', quantity: 500, unit: 'g' }
] as const

/**
 * Clear existing data (optional - for development)
 */
async function clearData() {
  console.log('🧹 Clearing existing data...')
  
  // Clear in correct order due to foreign key constraints
  await supabase.from('meals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('meal_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('pantry_items').delete().neq('user_id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('recipe_ingredients').delete().neq('recipe_id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('recipes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('ingredients').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  console.log('✅ Existing data cleared')
}

/**
 * Seed ingredients
 */
async function seedIngredients() {
  console.log('🥗 Seeding ingredients...')
  
  const { data, error } = await supabase
    .from('ingredients')
    .insert(SAMPLE_INGREDIENTS)
    .select()
  
  if (error) {
    console.error('❌ Failed to seed ingredients:', error)
    throw error
  }
  
  console.log(`✅ Seeded ${data.length} ingredients`)
  return data
}

/**
 * Seed recipes and their ingredient relationships
 */
async function seedRecipes(ingredients: any[]) {
  console.log('🍳 Seeding recipes...')
  
  for (const recipeData of SAMPLE_RECIPES) {
    // Insert recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        name: recipeData.name,
        steps: recipeData.steps,
        skill_level: recipeData.skill_level,
        default_servings: recipeData.default_servings
      })
      .select()
      .single()
    
    if (recipeError) {
      console.error(`❌ Failed to seed recipe "${recipeData.name}":`, recipeError)
      continue
    }
    
    // Insert recipe ingredients
    const recipeIngredients = recipeData.ingredients.map(ing => {
      const ingredient = ingredients.find(i => i.name === ing.name)
      if (!ingredient) {
        console.warn(`⚠️ Ingredient "${ing.name}" not found for recipe "${recipeData.name}"`)
        return null
      }
      
      return {
        recipe_id: recipe.id,
        ingredient_id: ingredient.id,
        quantity: ing.quantity,
        unit: ing.unit
      }
    }).filter(Boolean)
    
    if (recipeIngredients.length > 0) {
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(recipeIngredients)
      
      if (ingredientsError) {
        console.error(`❌ Failed to seed ingredients for recipe "${recipeData.name}":`, ingredientsError)
      }
    }
    
    console.log(`✅ Seeded recipe: ${recipeData.name}`)
  }
}

/**
 * Create demo user and populate pantry
 */
async function seedDemoUser(ingredients: any[]) {
  console.log('👤 Creating demo user...')
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: DEMO_USER.email,
    password: DEMO_USER.password,
    email_confirm: true
  })
  
  if (authError) {
    console.error('❌ Failed to create demo user:', authError)
    throw authError
  }
  
  console.log('✅ Demo user created in auth')
  
  // Update user profile with macro targets
  const { error: profileError } = await supabase
    .from('users')
    .update(DEMO_USER.profile)
    .eq('id', authData.user.id)
  
  if (profileError) {
    console.error('❌ Failed to update user profile:', profileError)
    throw profileError
  }
  
  console.log('✅ Demo user profile updated')
  
  // Populate pantry
  console.log('🥫 Populating demo user pantry...')
  
  const pantryItems = DEMO_PANTRY.map(pantryItem => {
    const ingredient = ingredients.find(i => i.name === pantryItem.ingredient)
    if (!ingredient) {
      console.warn(`⚠️ Ingredient "${pantryItem.ingredient}" not found for pantry`)
      return null
    }
    
    return {
      user_id: authData.user.id,
      ingredient_id: ingredient.id,
      quantity: pantryItem.quantity,
      unit: pantryItem.unit
    }
  }).filter(Boolean)
  
  const { error: pantryError } = await supabase
    .from('pantry_items')
    .insert(pantryItems)
  
  if (pantryError) {
    console.error('❌ Failed to populate pantry:', pantryError)
    throw pantryError
  }
  
  console.log(`✅ Populated pantry with ${pantryItems.length} items`)
  
  return authData.user
}

/**
 * Main seeding function
 */
async function main() {
  try {
    console.log('🌱 Starting MealPrep Pro database seeding...\n')
    
    // Optional: Clear existing data (uncomment for development)
    // await clearData()
    
    // Seed ingredients
    const ingredients = await seedIngredients()
    
    // Seed recipes
    await seedRecipes(ingredients)
    
    // Create demo user and populate pantry
    const demoUser = await seedDemoUser(ingredients)
    
    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`   • ${SAMPLE_INGREDIENTS.length} ingredients`)
    console.log(`   • ${SAMPLE_RECIPES.length} recipes`)
    console.log(`   • 1 demo user (${DEMO_USER.email})`)
    console.log(`   • ${DEMO_PANTRY.length} pantry items`)
    
    console.log('\n🚀 Ready to use:')
    console.log(`   • Email: ${DEMO_USER.email}`)
    console.log(`   • Password: ${DEMO_USER.password}`)
    console.log(`   • Macro targets: ${DEMO_USER.profile.kcal_target} kcal (${DEMO_USER.profile.protein_pct}P/${DEMO_USER.profile.carb_pct}C/${DEMO_USER.profile.fat_pct}F)`)
    
  } catch (error) {
    console.error('\n💥 Seeding failed:', error)
    process.exit(1)
  }
}

/**
 * Run the seeding script
 */
if (require.main === module) {
  main()
}

export { main as seed }

/**
 * TODO: Enhanced seeding features for future versions
 * 
 * 1. Multiple User Profiles:
 *    - Different macro targets (cutting, bulking, maintenance)
 *    - Various dietary restrictions (vegetarian, keto, etc.)
 *    - Different skill levels and preferences
 * 
 * 2. Seasonal Ingredients:
 *    - Mark ingredients as seasonal with availability periods
 *    - Price variations and cost optimization data
 *    - Regional availability information
 * 
 * 3. Advanced Recipe Data:
 *    - Recipe difficulty ratings and cooking time estimates
 *    - Equipment requirements and cooking methods
 *    - Recipe variations and substitution suggestions
 * 
 * 4. AI Training Data:
 *    - User preference patterns for taste learning
 *    - Recipe success rates and modifications
 *    - Macro optimization historical data
 */