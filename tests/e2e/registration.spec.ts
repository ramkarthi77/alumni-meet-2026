import { test, expect } from '@playwright/test'

test.describe('Public Registration', () => {
  test('loads the registration page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Alumni Meet 2026')).toBeVisible()
    await expect(page.getByText('Reconnect. Celebrate. Cherish Our Memories.')).toBeVisible()
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /submit registration/i }).click()
    await expect(page.getByText(/full name is required|name is required/i)).toBeVisible()
  })

  test('shows error for invalid phone', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel(/full name/i).fill('Test User')
    await page.getByLabel(/phone/i).fill('notaphone')
    await page.getByRole('button', { name: /submit registration/i }).click()
    await expect(page.getByText(/valid phone/i)).toBeVisible()
  })

  test('completes a registration successfully', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel(/full name/i).fill('Integration Test User')
    await page.getByLabel(/phone/i).fill(`+1555${Date.now().toString().slice(-7)}`)
    await page.getByLabel(/class/i).selectOption({ index: 2 })
    await page.getByLabel(/number of people/i).fill('2')
    // Leave contribution as 0
    await page.getByRole('button', { name: /submit registration/i }).click()
    // Should navigate to success page (or show duplicate error)
    await expect(page).toHaveURL(/\/(success|\?|#)/, { timeout: 10_000 })
  })
})

test.describe('Organizer Login', () => {
  test('renders login form', async ({ page }) => {
    await page.goto('/organizer/login')
    await expect(page.getByText(/organizer login/i)).toBeVisible()
  })

  test('shows error on wrong credentials', async ({ page }) => {
    await page.goto('/organizer/login')
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid email or password|too many/i)).toBeVisible({ timeout: 5000 })
  })

  test('redirects unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/organizer/dashboard')
    await expect(page).toHaveURL(/\/organizer\/login/)
  })

  test('redirects unauthenticated users from members page', async ({ page }) => {
    await page.goto('/organizer/members')
    await expect(page).toHaveURL(/\/organizer\/login/)
  })
})
