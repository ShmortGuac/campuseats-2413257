import { test, expect } from '@playwright/test'

// Screenshots of each view are saved to screenshots/ and uploaded by CI.
const shot = (page, name) => page.screenshot({ path: `screenshots/${name}.png`, fullPage: true })

const MY_VENDOR = '2413257-john-eats'

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

function addableCards(page) {
  return page.locator('.menu-card').filter({ has: page.getByRole('button', { name: 'Add to cart' }) })
}

test('home page lists the vendors from /api/vendors.json', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('status')).toBeVisible() // skeleton while loading
  await expect(page.locator('.vendor-card')).toHaveCount(1)
  await expect(page.locator('.vendor-card').first()).toContainText('John Eats')
  await expect(page.getByRole('link', { name: 'Vendors' })).toHaveClass(/active/)
  await shot(page, '1-home')
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
  await expect(page.locator('.vendor-card')).toHaveCount(1)
})

test('clicking a vendor opens its page at /vendor/:id', async ({ page }) => {
  await page.goto('/')
  const vendor = page.locator('.vendor-card').first()
  const name = await vendor.locator('h3').textContent()
  await vendor.click()
  await expect(page).toHaveURL(/\/vendor\/.+/)
  await expect(page.getByRole('heading', { name: `Menu: ${name}` })).toBeVisible()
})

test('deep links work: /vendor/:id, /cart and /orders open directly', async ({ page }) => {
  await page.goto(`/vendor/${MY_VENDOR}`)
  await expect(page.getByRole('heading', { name: 'Menu: John Eats' })).toBeVisible()
  await expect(page.locator('.menu-card')).toHaveCount(8)
  await expect(page.getByRole('button', { name: 'Sold out' })).toBeDisabled()
  await shot(page, '3-vendor')

  await page.goto('/cart')
  await expect(page.getByText('Your cart is empty')).toBeVisible()

  await page.goto('/orders')
  await expect(page.getByText('You have not placed any orders yet.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'My Orders' })).toHaveClass(/active/)
})

test('unknown vendor and unknown page', async ({ page }) => {
  await page.goto('/vendor/zzz')
  await expect(page.getByRole('heading', { name: 'Vendor not found' })).toBeVisible()
  await shot(page, '4-vendor-not-found')

  await page.goto('/nothing')
  await expect(page.getByRole('heading', { name: '404: Page not found' })).toBeVisible()
  await page.getByRole('link', { name: 'Go back home' }).click()
  await expect(page).toHaveURL('/')
})

test('cart merges quantities, updates totals and supports notes', async ({ page }) => {
  await page.goto(`/vendor/${MY_VENDOR}`)
  const cards = addableCards(page)
  const first = cards.nth(0)
  const second = cards.nth(1)
  const p1 = await priceOf(first)
  const p2 = await priceOf(second)

  await first.getByRole('button', { name: 'Add to cart' }).click()
  await first.getByRole('button', { name: 'Add to cart' }).click()
  await second.getByRole('button', { name: 'Add to cart' }).click()
  await expect(page.locator('.badge')).toHaveText('3') // total quantity, not lines

  await page.getByRole('link', { name: /Cart/ }).click()
  await expect(page).toHaveURL('/cart')
  const lines = page.locator('.cart-line')
  await expect(lines).toHaveCount(2) // same item twice = one line with qty 2
  await expect(lines.nth(0).locator('.qty span')).toHaveText('2')
  await expect(lines.nth(0).locator('.line-total')).toHaveText(`RM ${(p1 * 2).toFixed(2)}`)
  await expect(page.locator('.cart-total')).toHaveText(`Total: RM ${(p1 * 2 + p2).toFixed(2)}`)

  // Personal feature: a note on each cart line
  await lines.nth(0).getByRole('textbox').fill('No cheese please')
  await expect(lines.nth(0).getByRole('textbox')).toHaveValue('No cheese please')
  await shot(page, '5-cart')

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

test('the cart and its notes survive a page refresh', async ({ page }) => {
  await page.goto(`/vendor/${MY_VENDOR}`)
  await addableCards(page).first().getByRole('button', { name: 'Add to cart' }).click()
  await expect(page.locator('.badge')).toHaveText('1')
  await page.reload()
  await expect(page.locator('.badge')).toHaveText('1')

  await page.goto('/cart')
  await page.locator('.cart-line').getByRole('textbox').fill('Extra sauce')
  await page.reload()
  await expect(page.locator('.cart-line').getByRole('textbox')).toHaveValue('Extra sauce')
})

test('checkout validates every field, then goes to /orders', async ({ page }) => {
  await page.goto(`/vendor/${MY_VENDOR}`)
  const card = addableCards(page).first()
  const price = await priceOf(card)
  await card.getByRole('button', { name: 'Add to cart' }).click()
  await page.getByRole('link', { name: /Cart/ }).click()

  await page.getByRole('button', { name: 'Place order' }).click()
  const errors = page.locator('.field-error')
  await expect(errors).toHaveText([
    'Enter your name (at least 3 characters).',
    'Choose your mahallah.',
    'Choose a pickup time.',
  ])
  await shot(page, '6-checkout-errors')

  await page.getByLabel('Name').fill('Aiman')
  await page.getByLabel('Mahallah').selectOption('Ali')
  await page.getByLabel('Pickup time').fill('23:00')
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(errors).toHaveText(['Pickup time must be between 07:00 and 22:00.'])

  await page.getByLabel('Pickup time').fill('12:30')
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(page).toHaveURL('/orders')
  await expect(page.locator('.order')).toHaveCount(1)
  await expect(page.getByText('Pick up your order at 12:30')).toBeVisible()
  await expect(page.locator('.order')).toContainText(`Total: RM ${price.toFixed(2)}`)
  await expect(page.locator('.badge')).toHaveText('0')
  await shot(page, '7-orders')

  await page.reload()
  await expect(page.locator('.order')).toHaveCount(1) // orders survive a refresh
})

test('personal feature 7: notes are saved with the order and shown on /orders', async ({ page }) => {
  await page.goto(`/vendor/${MY_VENDOR}`)
  const cards = addableCards(page)
  await cards.nth(0).getByRole('button', { name: 'Add to cart' }).click()
  await cards.nth(1).getByRole('button', { name: 'Add to cart' }).click()
  await page.goto('/cart')

  await page.locator('.cart-line').nth(0).getByRole('textbox').fill('No cheese please')
  await page.getByLabel('Name').fill('Aiman')
  await page.getByLabel('Mahallah').selectOption('Ali')
  await page.getByLabel('Pickup time').fill('12:30')
  await page.getByRole('button', { name: 'Place order' }).click()

  await expect(page).toHaveURL('/orders')
  const notes = page.locator('.order-note')
  await expect(notes).toHaveText(['Note: No cheese please']) // empty notes are not shown
  await shot(page, '8-order-notes')

  await page.reload()
  await expect(notes).toHaveText(['Note: No cheese please'])
})
