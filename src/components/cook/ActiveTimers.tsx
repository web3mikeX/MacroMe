'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RotateCcw, X, Timer, Check } from 'lucide-react'

interface Timer {
  id: string
  name: string
  description: string
  duration: number
  remaining: number
  isActive: boolean
  isCompleted: boolean
  createdAt: number
  completedAt?: number
}

interface ActiveTimersProps {
  timers: Timer[]
  onToggleTimer: (timerId: string) => void
  onResetTimer: (timerId: string) => void
  onRemoveTimer: (timerId: string) => void
  formatTime: (seconds: number) => string
}

export default function ActiveTimers({
  timers,
  onToggleTimer,
  onResetTimer,
  onRemoveTimer,
  formatTime
}: ActiveTimersProps) {
  if (timers.length === 0) return null

  const getTimerColor = (timer: Timer) => {
    if (timer.isCompleted) return 'border-green-500 bg-green-50'
    if (timer.remaining <= 60) return 'border-red-500 bg-red-50'
    if (timer.remaining <= 300) return 'border-yellow-500 bg-yellow-50'
    return 'border-blue-500 bg-blue-50'
  }

  const getProgressPercentage = (timer: Timer) => {
    return ((timer.duration - timer.remaining) / timer.duration) * 100
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Active Timers ({timers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timers.map((timer) => (
            <div
              key={timer.id}
              className={`relative p-4 rounded-lg border-2 transition-all ${getTimerColor(timer)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs mb-1">
                    {timer.name}
                  </Badge>
                  <p className="text-sm font-medium leading-tight">
                    {timer.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 -mt-1 -mr-1"
                  onClick={() => onRemoveTimer(timer.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-3">
                <div className={`text-2xl font-bold ${timer.isCompleted ? 'text-green-600' : timer.remaining <= 60 ? 'text-red-600' : ''}`}>
                  {timer.isCompleted ? '00:00' : formatTime(timer.remaining)}
                </div>
                <div className="text-xs text-muted-foreground">
                  of {formatTime(timer.duration)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-1 mb-3">
                <div 
                  className={`h-1 rounded-full transition-all duration-1000 ${
                    timer.isCompleted ? 'bg-green-500' : 
                    timer.remaining <= 60 ? 'bg-red-500' : 
                    timer.remaining <= 300 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${getProgressPercentage(timer)}%` }}
                ></div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-2">
                {!timer.isCompleted && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleTimer(timer.id)}
                    >
                      {timer.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResetTimer(timer.id)}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </>
                )}
                {timer.isCompleted && (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Complete!
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}