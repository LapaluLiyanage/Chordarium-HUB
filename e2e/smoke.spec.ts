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

test('news shows live stories, searches, and falls back to samples', async ({ page }) => {
  const mk = (id: string, headline: string, date: string, section: string) => ({
    id, country: 'UK', section, headline, summary: 'x', byline: 'NME', art: 'stage', source: 'NME', url: `https://example.com/${id}`, date,
  })
  await page.route('**/api/news', (r) =>
    r.fulfill({ json: { stories: [mk('a', 'Alpha tour', '2026-01-01T00:00:00Z', 'LIVE'), mk('b', 'Beta vinyl', '2026-02-01T00:00:00Z', 'VINYL')] } }),
  )
  await page.goto('/news')
  await expect(page.locator('.story').first()).toContainText('Beta vinyl')
  await page.getByLabel('Sort stories').selectOption('oldest')
  await expect(page.locator('.story').first()).toContainText('Alpha tour')
  await page.getByLabel('Search headlines').fill('vinyl')
  await expect(page.locator('.story')).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'READ AT SOURCE' })).toHaveAttribute('href', 'https://example.com/b')
  await page.getByLabel('Search headlines').fill('zzz')
  await expect(page.getByText('No stories match these filters.').first()).toBeVisible()
})

test('news falls back to samples when the API is down', async ({ page }) => {
  await page.route('**/api/news', (r) => r.fulfill({ status: 502, body: '{}' }))
  await page.goto('/news')
  await expect(page.getByText(/live feed is unavailable/i)).toBeVisible()
  await expect(page.locator('.story').first()).toBeVisible()
})

for (const path of ['/learn', '/articles']) {
  test(`${path} page loads`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.getByRole('link', { name: /BACK TO CHORDARIUM/ })).toBeVisible()
  })
}
