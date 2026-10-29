import { expect, test } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })

test('home renders the wordmark, tools and ring', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Chordarium' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'EVERYTHING UNDER ONE RING.' })).toBeVisible()
  await expect(page.locator('.card')).toHaveCount(3)
  await page.locator('#ring').scrollIntoViewIfNeeded()
  await expect(page.locator('.ring-chord')).toBeVisible()
  expect(errors).toEqual([])
})

test('ring chips change the chord', async ({ page }) => {
  await page.goto('/#ring')
  const chips = page.locator('.chip')
  await expect(chips.first()).toBeVisible()
  const second = chips.nth(1)
  await second.click()
  await expect(second).toHaveAttribute('aria-pressed', 'true')
})

test('news filter narrows stories', async ({ page }) => {
  await page.goto('/news')
  await expect(page.getByText('THE CHORDARIUM TIMES')).toBeVisible()
  await page.getByRole('button', { name: 'UK' }).click()
  await expect(page.getByRole('button', { name: 'UK' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.story').first()).toContainText('UK')
})

for (const path of ['/learn', '/articles']) {
  test(`${path} page loads`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.getByRole('link', { name: /BACK TO CHORDARIUM/ })).toBeVisible()
  })
}
