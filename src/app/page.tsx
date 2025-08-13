import AuthTabs from '@/components/auth/AuthTabs'
import AuthCheck from '@/components/auth/AuthCheck'
import { Button } from '@/components/ui/button'
import { ChefHat, Clock, Target } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <AuthCheck
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                  <ChefHat className="h-8 w-8 text-green-600" />
                  <h1 className="text-3xl font-bold text-gray-900">MacroMe</h1>
                </div>
                
                <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Macro-Perfect
                  <span className="text-green-600"> Meal Plans</span>
                  <br />
                  From Your Pantry
                </h2>
                
                <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                  Automatically generate weekly meal plans that hit your exact macro targets using ingredients you already have. Then follow our guided batch-prep system to cook everything efficiently.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Target className="h-5 w-5 text-green-600" />
                    <span>Perfect macro targeting</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <ChefHat className="h-5 w-5 text-green-600" />
                    <span>Uses your pantry items</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span>Guided batch cooking</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-md w-full">
                <AuthTabs />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ChefHat className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">MacroMe</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome back!
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Ready to create your next macro-perfect meal plan?
          </p>

          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8 py-4">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </AuthCheck>
  )
}
