'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  Lightbulb,
  TrendingUp,
  ChefHat,
  ShoppingCart,
  Sparkles,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AISuggestion {
  id: string
  suggestion_type: string
  suggested_recipes: unknown[]
  reasoning: string
  confidence_score: number
  created_at: string
}

interface AIInsightProps {
  userId: string
  pantryItems: unknown[]
  userProfile: unknown
}

export default function AIPoweredInsights({
  userId,
  pantryItems,
  userProfile,
}: AIInsightProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [aiFeatures, setAiFeatures] = useState({
    adaptRecipes: true,
    generateSuggestions: true,
    optimizePantry: true,
    smartSubstitutions: true,
  })

  useEffect(() => {
    const fetchAISuggestions = async () => {
      try {
        const response = await fetch(
          `/api/ai-meal-plan?userId=${userId}&type=all`
        )
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error('Failed to fetch AI suggestions:', error)
      }
    }
    fetchAISuggestions()
  }, [userId])

  const generateAIMealPlan = async () => {
    setIsGeneratingPlan(true)
    try {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1) // Start of current week

      const response = await fetch('/api/ai-meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          weekStart: weekStart.toISOString(),
          preferences: {
            cuisineTypes: ['mediterranean', 'asian'],
            dietaryRestrictions: [],
            spiceLevel: 'medium',
            cookingTime: 'moderate',
            budget: 'medium',
          },
          aiEnhancements: aiFeatures,
        }),
      })

      if (response.ok) {
        toast.success('🤖 AI-powered meal plan generated successfully!')

        // Navigate to the new meal plan
        const weekParam = weekStart.toISOString().split('T')[0]
        window.location.href = `/plan/${weekParam}`
      } else {
        throw new Error('Failed to generate AI meal plan')
      }
    } catch (error) {
      console.error('AI meal plan generation failed:', error)
      toast.error('Failed to generate AI meal plan. Please try again.')
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const pantryOptimizationScore = Math.min(
    100,
    Math.round((pantryItems.length / 20) * 100)
  )
  const aiReadinessScore = Math.round(
    (pantryItems.length > 5 ? 30 : pantryItems.length * 6) +
      (userProfile?.kcal_target ? 25 : 0) +
      (userProfile?.protein_pct ? 25 : 0) +
      20 // Base readiness
  )

  return (
    <div className="space-y-6">
      {/* AI Status Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI-Powered Meal Planning
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              New!
            </Badge>
          </CardTitle>
          <CardDescription>
            Intelligent meal planning with recipe adaptation and smart
            suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {aiReadinessScore}%
              </div>
              <div className="text-sm text-muted-foreground">AI Readiness</div>
              <Progress value={aiReadinessScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {pantryOptimizationScore}%
              </div>
              <div className="text-sm text-muted-foreground">
                Pantry Optimization
              </div>
              <Progress value={pantryOptimizationScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {suggestions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                AI Suggestions
              </div>
            </div>
          </div>

          <Button
            onClick={generateAIMealPlan}
            disabled={isGeneratingPlan}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            {isGeneratingPlan ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Generating AI Meal Plan...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI-Powered Meal Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Features Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI Enhancement Settings
          </CardTitle>
          <CardDescription>
            Customize which AI features to use in your meal planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(aiFeatures).map(([key, enabled]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {key === 'adaptRecipes' && (
                    <ChefHat className="h-4 w-4 text-orange-500" />
                  )}
                  {key === 'generateSuggestions' && (
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                  )}
                  {key === 'optimizePantry' && (
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                  )}
                  {key === 'smartSubstitutions' && (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm font-medium">
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())}
                  </span>
                </div>
                <Button
                  variant={enabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setAiFeatures((prev) => ({ ...prev, [key]: !enabled }))
                  }
                >
                  {enabled ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Recent AI Suggestions
            </CardTitle>
            <CardDescription>
              Personalized meal recommendations based on your pantry and
              preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="pantry">Pantry-Based</TabsTrigger>
                <TabsTrigger value="optimized">Macro-Optimized</TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-4">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <div key={suggestion.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="capitalize">
                        {suggestion.suggestion_type.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(suggestion.created_at).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {suggestion.reasoning}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {suggestion.suggested_recipes.length} recipe
                          suggestions
                        </span>
                        <Progress
                          value={suggestion.confidence_score * 100}
                          className="w-16 h-2"
                        />
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>AI Meal Suggestions</DialogTitle>
                            <DialogDescription>
                              Detailed breakdown of AI-generated meal
                              recommendations
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {suggestion.suggested_recipes.map(
                              (recipe, index) => (
                                <div
                                  key={index}
                                  className="p-4 border rounded-lg"
                                >
                                  <h4 className="font-medium mb-2">
                                    {recipe.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {recipe.description}
                                  </p>
                                  <div className="flex gap-4 text-xs">
                                    <span>
                                      🔥 {recipe.macros?.calories || 0} cal
                                    </span>
                                    <span>
                                      🥩 {recipe.macros?.protein || 0}g protein
                                    </span>
                                    <span>
                                      🌾 {recipe.macros?.carbs || 0}g carbs
                                    </span>
                                    <span>
                                      🥑 {recipe.macros?.fat || 0}g fat
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="pantry">
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Pantry-based suggestions will appear here</p>
                  <p className="text-sm">
                    Generate an AI meal plan to see personalized suggestions
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="optimized">
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Macro-optimized suggestions will appear here</p>
                  <p className="text-sm">
                    AI will learn your preferences as you use the app
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* AI Tips & Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Pantry Optimization
                </p>
                <p className="text-xs text-blue-700">
                  Add {Math.max(0, 15 - pantryItems.length)} more ingredients to
                  unlock advanced AI meal planning
                </p>
              </div>
            </div>

            {aiReadinessScore < 80 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Complete Your Profile
                  </p>
                  <p className="text-xs text-yellow-700">
                    Set your macro targets to improve AI meal plan accuracy
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  AI Learning Active
                </p>
                <p className="text-xs text-green-700">
                  The AI is learning from your interactions to provide better
                  recommendations
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
