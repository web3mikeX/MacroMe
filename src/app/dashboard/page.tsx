import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: pantryItems } = await supabase
    .from('pantry_items')
    .select(`
      *,
      ingredients (*)
    `)
    .eq('user_id', user.id)

  const { data: ingredients } = await supabase
    .from('ingredients')
    .select('*')
    .order('name')

  return (
    <DashboardClient
      user={user}
      userProfile={userProfile}
      pantryItems={pantryItems || []}
      ingredients={ingredients || []}
    />
  )
}