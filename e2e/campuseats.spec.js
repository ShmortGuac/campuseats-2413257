import { test, expect } from '@playwright/test'

// Screenshots of each view are saved to screenshots/ and uploaded by CI.
const shot = (page, name) => page.screenshot({ path: `screenshots/${name}.png`, fullPage: true })

// Fail any test that logs a console error (except the 404 we force on purpose).
let consoleErrors = []

test.beforeEach(async ({ page }) => {
  consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('404')) consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => consoleErrors.push(err.message))
})

test.afterEach(async () => {
  expect(consoleErrors).toEqual([])
})

// Reads "RM 12.00" from a menu card and returns 12
async function priceOf(card) {
  return Number((await card.locator('.price').textContent()).replace('RM', '').trim())
}

test('loads the menus from /api/vendors.json', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('status')).toBeVisible() // skeleton while loading
  await expect(page.locator('.vendor-card')).toHaveCount(3)
  await expect(page.locator('.vendor-card').first()).toHaveClass(/selected/)
  await expect(page.getByRole('heading', { name: 'Menu: John Eats' })).toBeVisible()
  await expect(page.locator('.menu-card')).toHaveCount(8)
  await expect(page.getByRole('button', { name: 'Sold out' })).toBeDisabled()
  await shot(page, '1-menu')
})

test('shows an error with Try again when the fetch fails', async ({ page }) => {
  let failed = false
  await page.route('**/api/vendors.json', (route) => {
    if (failed) return route.continue()
    failed = true
    return route.fulfill({ status: 404, body: 'Not found' })
  })
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('Could not load menus: HTTP 404')
  await shot(page, '2-error')
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.locator('.menu-card')).toHaveCount(8)
})

test('clicking a vendor switches the menu', async ({ page }) => {
  await page.goto('/')
  const second = page.locator('.vendor-card').nth(1)
  const name = await second.locator('h3').textContent()
  await second.click()
  await expect(second).toHaveClass(/selected/)
  await expect(page.getByRole('heading', { name: `Menu: ${name}` })).toBeVisible()
})

test('cart merges quantities, updates totals and supports notes', async ({ page }) => {
  await page.goto('/')
  const cards = page.locator('.menu-card').filter({ has: page.getByRole('button', { name: 'Add to cart' }) })
  const first = cards.nth(0)
  const second = cards.nth(1)
  const p1 = await priceOf(first)
  const p2 = await priceOf(second)

  await first.getByRole('button', { name: 'Add to cart' }).click()
  await first.getByRole('button', { name: 'Add to cart' }).click()
  await second.getByRole('button', { name: 'Add to cart' }).click()
  await expect(page.locator('.badge')).toHaveText('3') // total quantity, not lines

  await page.getByRole('button', { name: /Cart/ }).click()
  const lines = page.locator('.cart-line')
  await expect(lines).toHaveCount(2) // same item twice = one line with qty 2
  await expect(lines.nth(0).locator('.qty span')).toHaveText('2')
  await expect(lines.nth(0).locator('.line-total')).toHaveText(`RM ${(p1 * 2).toFixed(2)}`)
  await expect(page.locator('.cart-total')).toHaveText(`Total: RM ${(p1 * 2 + p2).toFixed(2)}`)

  // Personal feature: a note on each cart line
  await lines.nth(0).getByRole('textbox').fill('No cheese please')
  await expect(lines.nth(0).getByRole('textbox')).toHaveValue('No cheese please')
  await shot(page, '3-cart')

  // + on line 1, − on line 2 (qty 1 -> 0 removes the line)
  await lines.nth(0).getByRole('button', { name: '+' }).click()
  await lines.nth(1).getByRole('button', { name: '−' }).click()
  await expect(lines).toHaveCount(1)
  await expect(page.locator('.badge')).toHaveText('3')
  await expect(page.locator('.cart-total')).toHaveText(`Total: RM ${(p1 * 3).toFixed(2)}`)

  await page.getByRole('button', { name: 'Remove' }).click()
  await expect(page.getByText('Your cart is empty')).toBeVisible()
  await expect(page.locator('.badge')).toHaveText('0')
})

test('checkout validates every field, then places the order', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('.menu-card').filter({ has: page.getByRole('button', { name: 'Add to cart' }) }).first()
  const price = await priceOf(card)
  await card.getByRole('button', { name: 'Add to cart' }).click()
  await page.getByRole('button', { name: /Cart/ }).click()

  await page.getByRole('button', { name: 'Place order' }).click()
  const errors = page.locator('.field-error')
  await expect(errors).toHaveText([
    'Enter your name (at least 3 characters).',
    'Choose your mahallah.',
    'Choose a pickup time.',
  ])
  await shot(page, '4-checkout-errors')

  await page.getByLabel('Name').fill('Aiman')
  await page.getByLabel('Mahallah').selectOption('Ali')
  await page.getByLabel('Pickup time').fill('23:00')
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(errors).toHaveText(['Pickup time must be between 07:00 and 22:00.'])

  await page.getByLabel('Pickup time').fill('12:30')
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(page.getByRole('heading', { name: 'Order placed.' })).toBeVisible()
  await expect(page.getByText('Pick up your order at 12:30')).toBeVisible()
  await expect(page.getByText(`Total: RM ${price.toFixed(2)}`)).toBeVisible()
  await expect(page.locator('.badge')).toHaveText('0')
  await shot(page, '5-order-placed')
})
