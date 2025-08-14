'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Target, Edit } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Database } from '@/lib/types/database'

type UserProfile = Database['public']['Tables']['users']['Row']

interface MacroTargetsProps {
  userProfile: UserProfile | null
}

export default function MacroTargets({ userProfile }: MacroTargetsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [targets, setTargets] = useState({
    kcal_target: userProfile?.kcal_target || 2000,
    protein_pct: userProfile?.protein_pct || 30,
    carb_pct: userProfile?.carb_pct || 40,
    fat_pct: userProfile?.fat_pct || 30,
  })

  const supabase = createClient()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update(targets)
        .eq('id', userProfile?.id)

      if (error) throw error

      toast.success('Macro targets updated successfully!')
      setIsOpen(false)
      // Refresh the page to show updated values
      window.location.reload()
    } catch (error) {
      console.error('Error updating targets:', error)
      toast.error('Failed to update macro targets')
    } finally {
      setIsLoading(false)
    }
  }

  const proteinGrams = Math.round(
    (targets.kcal_target * targets.protein_pct) / 100 / 4
  )
  const carbGrams = Math.round(
    (targets.kcal_target * targets.carb_pct) / 100 / 4
  )
  const fatGrams = Math.round((targets.kcal_target * targets.fat_pct) / 100 / 9)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Macro Targets
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Macro Targets</DialogTitle>
                <DialogDescription>
                  Set your daily calorie and macronutrient targets for meal
                  planning.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="calories">Daily Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={targets.kcal_target}
                    onChange={(e) =>
                      setTargets((prev) => ({
                        ...prev,
                        kcal_target: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="protein">Protein %</Label>
                    <Input
                      id="protein"
                      type="number"
                      min="10"
                      max="50"
                      value={targets.protein_pct}
                      onChange={(e) =>
                        setTargets((prev) => ({
                          ...prev,
                          protein_pct: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {proteinGrams}g
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="carbs">Carbs %</Label>
                    <Input
                      id="carbs"
                      type="number"
                      min="20"
                      max="70"
                      value={targets.carb_pct}
                      onChange={(e) =>
                        setTargets((prev) => ({
                          ...prev,
                          carb_pct: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {carbGrams}g
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="fat">Fat %</Label>
                    <Input
                      id="fat"
                      type="number"
                      min="15"
                      max="50"
                      value={targets.fat_pct}
                      onChange={(e) =>
                        setTargets((prev) => ({
                          ...prev,
                          fat_pct: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {fatGrams}g
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total:{' '}
                  {targets.protein_pct + targets.carb_pct + targets.fat_pct}%
                  {targets.protein_pct + targets.carb_pct + targets.fat_pct !==
                    100 && (
                    <span className="text-red-500 ml-2">Should equal 100%</span>
                  )}
                </div>
                <Button
                  onClick={handleSave}
                  disabled={
                    isLoading ||
                    targets.protein_pct + targets.carb_pct + targets.fat_pct !==
                      100
                  }
                  className="w-full"
                >
                  {isLoading ? 'Saving...' : 'Save Targets'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>Your daily macro and calorie targets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold">
            {userProfile?.kcal_target?.toLocaleString('en-US') || '2,000'}
          </div>
          <div className="text-sm text-muted-foreground">calories per day</div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-700">
              {Math.round(
                ((userProfile?.kcal_target || 2000) *
                  (userProfile?.protein_pct || 30)) /
                  100 /
                  4
              )}
              g
            </div>
            <div className="text-sm text-green-600">Protein</div>
            <div className="text-xs text-muted-foreground">
              {userProfile?.protein_pct || 30}%
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-700">
              {Math.round(
                ((userProfile?.kcal_target || 2000) *
                  (userProfile?.carb_pct || 40)) /
                  100 /
                  4
              )}
              g
            </div>
            <div className="text-sm text-blue-600">Carbs</div>
            <div className="text-xs text-muted-foreground">
              {userProfile?.carb_pct || 40}%
            </div>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-semibold text-orange-700">
              {Math.round(
                ((userProfile?.kcal_target || 2000) *
                  (userProfile?.fat_pct || 30)) /
                  100 /
                  9
              )}
              g
            </div>
            <div className="text-sm text-orange-600">Fat</div>
            <div className="text-xs text-muted-foreground">
              {userProfile?.fat_pct || 30}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
