'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Package, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Database } from '@/lib/types/database'

type PantryItem = Database['public']['Tables']['pantry_items']['Row'] & {
  ingredients: Database['public']['Tables']['ingredients']['Row']
}
type Ingredient = Database['public']['Tables']['ingredients']['Row']

interface PantryManagerProps {
  pantryItems: PantryItem[]
  ingredients: Ingredient[]
  onPantryUpdate: (items: PantryItem[]) => void
}

export default function PantryManager({ pantryItems, ingredients, onPantryUpdate }: PantryManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    ingredient_id: '',
    quantity: '',
    unit: '',
  })

  const supabase = createClient()

  const resetForm = () => {
    setFormData({ ingredient_id: '', quantity: '', unit: '' })
    setEditingItem(null)
  }

  const handleAdd = async () => {
    if (!formData.ingredient_id || !formData.quantity || !formData.unit) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('pantry_items')
        .insert({
          user_id: user.id,
          ingredient_id: formData.ingredient_id,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
        })

      if (error) throw error

      // Fetch updated pantry items
      const { data: updatedItems } = await supabase
        .from('pantry_items')
        .select(`
          *,
          ingredients (*)
        `)
        .eq('user_id', user.id)

      onPantryUpdate(updatedItems || [])
      toast.success('Item added to pantry!')
      setIsAddOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add item to pantry')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editingItem || !formData.quantity || !formData.unit) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('pantry_items')
        .update({
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
        })
        .eq('user_id', editingItem.user_id)
        .eq('ingredient_id', editingItem.ingredient_id)

      if (error) throw error

      // Update local state
      const updatedItems = pantryItems.map(item =>
        item.ingredient_id === editingItem.ingredient_id
          ? { ...item, quantity: parseFloat(formData.quantity), unit: formData.unit }
          : item
      )
      onPantryUpdate(updatedItems)
      toast.success('Item updated!')
      setEditingItem(null)
      resetForm()
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Failed to update item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (item: PantryItem) => {
    try {
      const { error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('user_id', item.user_id)
        .eq('ingredient_id', item.ingredient_id)

      if (error) throw error

      // Update local state
      const updatedItems = pantryItems.filter(p => p.ingredient_id !== item.ingredient_id)
      onPantryUpdate(updatedItems)
      toast.success('Item removed from pantry')
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to remove item')
    }
  }

  const openEditDialog = (item: PantryItem) => {
    setEditingItem(item)
    setFormData({
      ingredient_id: item.ingredient_id,
      quantity: item.quantity.toString(),
      unit: item.unit,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pantry Management
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Pantry Item</DialogTitle>
                <DialogDescription>
                  Add ingredients you have available for meal planning.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ingredient">Ingredient</Label>
                  <Select value={formData.ingredient_id} onValueChange={(value) => setFormData(prev => ({ ...prev, ingredient_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an ingredient" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredients
                        .filter(ing => !pantryItems.some(p => p.ingredient_id === ing.id))
                        .map((ingredient) => (
                          <SelectItem key={ingredient.id} value={ingredient.id}>
                            {ingredient.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.1"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">grams</SelectItem>
                        <SelectItem value="kg">kilograms</SelectItem>
                        <SelectItem value="ml">milliliters</SelectItem>
                        <SelectItem value="l">liters</SelectItem>
                        <SelectItem value="piece">pieces</SelectItem>
                        <SelectItem value="cup">cups</SelectItem>
                        <SelectItem value="tbsp">tablespoons</SelectItem>
                        <SelectItem value="tsp">teaspoons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAdd} disabled={isLoading} className="w-full">
                  {isLoading ? 'Adding...' : 'Add to Pantry'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Manage ingredients available in your pantry ({pantryItems.length} items)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pantryItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Your pantry is empty</p>
            <p className="text-sm">Add some ingredients to get started with meal planning</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Nutrition (per 100g)</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pantryItems.map((item) => (
                <TableRow key={item.ingredient_id}>
                  <TableCell className="font-medium">
                    {item.ingredients.name}
                  </TableCell>
                  <TableCell>
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.ingredients.kcal}cal
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        P:{item.ingredients.protein}g
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        C:{item.ingredients.carbs}g
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        F:{item.ingredients.fat}g
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(item)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pantry Item</DialogTitle>
              <DialogDescription>
                Update the quantity and unit for {editingItem?.ingredients.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">grams</SelectItem>
                      <SelectItem value="kg">kilograms</SelectItem>
                      <SelectItem value="ml">milliliters</SelectItem>
                      <SelectItem value="l">liters</SelectItem>
                      <SelectItem value="piece">pieces</SelectItem>
                      <SelectItem value="cup">cups</SelectItem>
                      <SelectItem value="tbsp">tablespoons</SelectItem>
                      <SelectItem value="tsp">teaspoons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEdit} disabled={isLoading} className="flex-1">
                  {isLoading ? 'Updating...' : 'Update Item'}
                </Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}