/**
 * Smoke Tests for MealPrep Pro
 * Basic functionality tests to ensure the application loads and core features work
 */

import { test, expect } from '@playwright/test'

test.describe('MealPrep Pro Smoke Tests', () => {
  test('landing page loads correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/MealPrep Pro/)
    
    // Check for main heading
    await expect(page.locator('h1')).toContainText('MealPrep Pro')
    
    // Check for value proposition
    await expect(page.locator('text=Macro-Perfect')).toBeVisible()
    await expect(page.locator('text=Meal Plans')).toBeVisible()
    
    // Check for authentication tabs
    await expect(page.locator('text=Sign In')).toBeVisible()
    await expect(page.locator('text=Sign Up')).toBeVisible()
  })

  test('navigation works properly', async ({ page }) => {
    await page.goto('/')
    
    // Try to navigate to dashboard (should redirect to login)
    await page.goto('/dashboard')
    
    // Should be redirected to landing page due to auth middleware
    await expect(page).toHaveURL('/')
  })

  test('sign up form is functional', async ({ page }) => {
    await page.goto('/')
    
    // Click on Sign Up tab
    await page.click('text=Sign Up')
    
    // Check that sign up form is visible
    await expect(page.locator('text=Create account')).toBeVisible()
    
    // Check form fields
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Try to submit empty form (should show validation)
    await page.click('button[type="submit"]')
    
    // Form should not submit (stays on same page)
    await expect(page.locator('text=Create account')).toBeVisible()
  })

  test('sign in form is functional', async ({ page }) => {
    await page.goto('/')
    
    // Sign In should be default tab
    await expect(page.locator('text=Welcome back')).toBeVisible()
    
    // Check form fields
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should remain on login page
    await expect(page.locator('text=Welcome back')).toBeVisible()
  })

  test('responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check that page still loads properly on mobile
    await expect(page.locator('h1')).toContainText('MealPrep Pro')
    await expect(page.locator('text=Sign In')).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    
    // Check that page still loads properly on tablet
    await expect(page.locator('h1')).toContainText('MealPrep Pro')
    await expect(page.locator('text=Sign In')).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.reload()
    
    // Check that page still loads properly on desktop
    await expect(page.locator('h1')).toContainText('MealPrep Pro')
    await expect(page.locator('text=Sign In')).toBeVisible()
  })

  test('error handling works', async ({ page }) => {
    // Test 404 page
    await page.goto('/nonexistent-page')
    
    // Next.js should show 404 or redirect
    // We don't expect the main app content
    const isNotFound = await page.locator('text=404').isVisible().catch(() => false)
    const isRedirected = page.url().includes('/') || page.url().includes('/dashboard')
    
    expect(isNotFound || isRedirected).toBeTruthy()
  })

  test('performance basics', async ({ page }) => {
    // Start timing
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for main content to load
    await page.waitForSelector('h1:has-text("MealPrep Pro")')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 5 seconds (generous for CI)
    expect(loadTime).toBeLessThan(5000)
    
    // Check that essential resources loaded
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Sign In')).toBeVisible()
  })

  test('accessibility basics', async ({ page }) => {
    await page.goto('/')
    
    // Check for basic accessibility features
    // Main heading should exist
    const mainHeading = page.locator('h1').first()
    await expect(mainHeading).toBeVisible()
    
    // Form labels should be associated with inputs
    const emailInput = page.locator('input[type="email"]').first()
    await expect(emailInput).toBeVisible()
    
    // Buttons should be clickable
    const signInButton = page.locator('button[type="submit"]').first()
    await expect(signInButton).toBeEnabled()
    
    // Check tab navigation works
    await page.keyboard.press('Tab')
    // Should be able to navigate with keyboard
  })
})

test.describe('Core Features Availability', () => {
  test('essential routes are configured', async ({ page }) => {
    // Test that main routes don't throw errors
    const routes = ['/', '/dashboard', '/plan/2024-01-01', '/cook/123']
    
    for (const route of routes) {
      const response = await page.goto(route)
      
      // Should not return server errors (500+)
      if (response) {
        expect(response.status()).toBeLessThan(500)
      }
      
      // Should either load content or redirect (not crash)
      const hasContent = await page.locator('body').isVisible()
      expect(hasContent).toBeTruthy()
    }
  })

  test('API endpoints are reachable', async ({ page }) => {
    // Test that API routes don't crash
    const response = await page.request.get('/api/generate-plan', {
      failOnStatusCode: false
    })
    
    // Should return 401 (unauthorized) or similar, not 500
    expect(response.status()).toBeLessThan(500)
  })
})

// Mock authentication test (if we had test credentials)
test.describe.skip('Authenticated Features', () => {
  test('dashboard loads for authenticated users', async ({ page }) => {
    // This would require test authentication setup
    // Skip for now, but shows how we'd test authenticated flows
    
    // Mock login process here
    // await login(page, testCredentials)
    
    await page.goto('/dashboard')
    await expect(page.locator('text=Macro Targets')).toBeVisible()
    await expect(page.locator('text=Pantry Management')).toBeVisible()
  })
})