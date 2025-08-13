import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePlan } from '@/lib/macroTetris'

export async function POST(request: NextRequest) {
  try {
    const { userId, weekStart } = await request.json()

    if (!userId || !weekStart) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify user authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate the meal plan using Macro Tetris algorithm
    const result = await generatePlan(userId, new Date(weekStart))

    return NextResponse.json(result)
  } catch (error) {
    console.error('API: Meal plan generation failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}