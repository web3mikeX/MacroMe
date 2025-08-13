/**
 * useTimer Hook - Enhanced Timer Management for Cooking Mode
 * 
 * This custom React hook provides sophisticated timer management for the cooking interface,
 * including multiple simultaneous timers, notifications, and persistence.
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface Timer {
  id: string
  name: string
  description: string
  duration: number // in seconds
  remaining: number
  isActive: boolean
  isCompleted: boolean
  createdAt: number
  completedAt?: number
}

export interface TimerHookReturn {
  timers: Timer[]
  createTimer: (name: string, description: string, duration: number) => string
  startTimer: (id: string) => void
  pauseTimer: (id: string) => void
  resumeTimer: (id: string) => void
  resetTimer: (id: string) => void
  removeTimer: (id: string) => void
  clearCompletedTimers: () => void
  formatTime: (seconds: number) => string
  getActiveCount: () => number
  getCompletedCount: () => number
}

interface TimerNotificationOptions {
  showBrowserNotification?: boolean
  playSound?: boolean
  customMessage?: string
}

const DEFAULT_NOTIFICATION_OPTIONS: TimerNotificationOptions = {
  showBrowserNotification: true,
  playSound: false,
  customMessage: undefined
}

/**
 * Custom hook for managing multiple cooking timers
 */
export function useTimer(
  notificationOptions: TimerNotificationOptions = DEFAULT_NOTIFICATION_OPTIONS
): TimerHookReturn {
  const [timers, setTimers] = useState<Timer[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null)

  // Request notification permission on mount
  useEffect(() => {
    if (notificationOptions.showBrowserNotification && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }

    // Initialize audio for notifications if needed
    if (notificationOptions.playSound && !notificationAudioRef.current) {
      notificationAudioRef.current = new Audio('/sounds/timer-complete.mp3') // TODO: Add sound file
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [notificationOptions])

  // Main timer tick - runs every second
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (!timer.isActive || timer.isCompleted) return timer

          const newRemaining = Math.max(0, timer.remaining - 1)
          const justCompleted = newRemaining === 0 && timer.remaining > 0

          if (justCompleted) {
            // Handle timer completion
            handleTimerComplete(timer, notificationOptions)
            
            return {
              ...timer,
              remaining: 0,
              isActive: false,
              isCompleted: true,
              completedAt: Date.now()
            }
          }

          return {
            ...timer,
            remaining: newRemaining
          }
        })
      )
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [notificationOptions])

  /**
   * Handle timer completion with notifications
   */
  const handleTimerComplete = useCallback((timer: Timer, options: TimerNotificationOptions) => {
    const message = options.customMessage || `Timer "${timer.name}" completed!`

    // Browser notification
    if (options.showBrowserNotification && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Cooking Timer Complete!', {
        body: `${timer.name}: ${timer.description}`,
        icon: '/favicon.ico',
        tag: `timer-${timer.id}`,
        requireInteraction: true // Keep notification until user interacts
        // TODO: Actions require service worker registration for web push notifications
      })
    }

    // Play sound notification
    if (options.playSound && notificationAudioRef.current) {
      notificationAudioRef.current.play().catch(console.error)
    }

    // Visual feedback (could be expanded with toast notifications)
    console.log('Timer completed:', message)
  }, [])

  /**
   * Create a new timer
   */
  const createTimer = useCallback((name: string, description: string, duration: number): string => {
    const id = `timer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newTimer: Timer = {
      id,
      name,
      description,
      duration,
      remaining: duration,
      isActive: false,
      isCompleted: false,
      createdAt: Date.now()
    }

    setTimers(prev => [...prev, newTimer])
    return id
  }, [])

  /**
   * Start or resume a timer
   */
  const startTimer = useCallback((id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, isActive: true, isCompleted: false }
          : timer
      )
    )
  }, [])

  /**
   * Pause a timer
   */
  const pauseTimer = useCallback((id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, isActive: false }
          : timer
      )
    )
  }, [])

  /**
   * Resume a paused timer
   */
  const resumeTimer = useCallback((id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, isActive: true, isCompleted: false }
          : timer
      )
    )
  }, [])

  /**
   * Reset a timer to its original duration
   */
  const resetTimer = useCallback((id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { 
              ...timer, 
              remaining: timer.duration, 
              isActive: false, 
              isCompleted: false,
              completedAt: undefined
            }
          : timer
      )
    )
  }, [])

  /**
   * Remove a timer completely
   */
  const removeTimer = useCallback((id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id))
  }, [])

  /**
   * Clear all completed timers
   */
  const clearCompletedTimers = useCallback(() => {
    setTimers(prev => prev.filter(timer => !timer.isCompleted))
  }, [])

  /**
   * Format time in MM:SS format
   */
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  /**
   * Get count of active timers
   */
  const getActiveCount = useCallback((): number => {
    return timers.filter(timer => timer.isActive).length
  }, [timers])

  /**
   * Get count of completed timers
   */
  const getCompletedCount = useCallback((): number => {
    return timers.filter(timer => timer.isCompleted).length
  }, [timers])

  return {
    timers,
    createTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    removeTimer,
    clearCompletedTimers,
    formatTime,
    getActiveCount,
    getCompletedCount
  }
}

/**
 * Predefined timer presets for common cooking tasks
 */
export const TIMER_PRESETS = {
  // Basic cooking times
  softBoiledEgg: { name: 'Soft Boiled Egg', duration: 6 * 60 },
  hardBoiledEgg: { name: 'Hard Boiled Egg', duration: 12 * 60 },
  pastaALDente: { name: 'Pasta (Al Dente)', duration: 8 * 60 },
  riceWhite: { name: 'White Rice', duration: 18 * 60 },
  riceBrown: { name: 'Brown Rice', duration: 45 * 60 },
  
  // Protein cooking
  chickenBreast: { name: 'Chicken Breast', duration: 20 * 60 },
  salmonFillet: { name: 'Salmon Fillet', duration: 15 * 60 },
  steakMediumRare: { name: 'Steak (Medium Rare)', duration: 4 * 60 },
  
  // Vegetables
  steamVegetables: { name: 'Steam Vegetables', duration: 5 * 60 },
  roastVegetables: { name: 'Roast Vegetables', duration: 25 * 60 },
  sauteVegetables: { name: 'Sauté Vegetables', duration: 8 * 60 },
  
  // Baking
  quickBread: { name: 'Quick Bread', duration: 45 * 60 },
  cookies: { name: 'Cookies', duration: 12 * 60 },
  roastChicken: { name: 'Whole Roast Chicken', duration: 75 * 60 },
  
  // Rest/Prep times
  restMeat: { name: 'Rest Meat', duration: 5 * 60 },
  proofDough: { name: 'Proof Dough', duration: 60 * 60 },
  marinate: { name: 'Quick Marinate', duration: 15 * 60 },
  
  // Custom intervals
  checkStir: { name: 'Check & Stir', duration: 5 * 60 },
  flip: { name: 'Flip/Turn', duration: 10 * 60 },
  baste: { name: 'Baste', duration: 15 * 60 }
}

/**
 * Helper function to create timer from preset
 */
export function createPresetTimer(
  preset: keyof typeof TIMER_PRESETS,
  customDescription?: string
) {
  const presetData = TIMER_PRESETS[preset]
  return {
    name: presetData.name,
    description: customDescription || `Cooking timer for ${presetData.name.toLowerCase()}`,
    duration: presetData.duration
  }
}

/**
 * TODO: Future enhancements for the timer system
 * 
 * 1. Timer Templates:
 *    - Save custom timer combinations for specific recipes
 *    - Share timer templates with other users
 *    - AI-suggested timers based on cooking steps
 * 
 * 2. Smart Notifications:
 *    - Progressive alerts (5 min, 1 min, 30 sec warnings)
 *    - Context-aware notifications based on cooking stage
 *    - Integration with smart home devices
 * 
 * 3. Analytics:
 *    - Track cooking time accuracy vs. recipe estimates
 *    - Learn user preferences for cooking doneness
 *    - Suggest timing adjustments based on past performance
 * 
 * 4. Collaborative Cooking:
 *    - Sync timers across multiple devices
 *    - Share timer states with cooking partners
 *    - Team cooking coordination features
 */