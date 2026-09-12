import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { setTimeout as pause } from 'node:timers/promises'
import { chromium } from 'playwright-core'

// Production bundle, real Chrome, deterministic API failures and delayed responses.
// No credentials, network data, or browser binaries are stored in the repository.
const executablePath =
  process.env.CHROME_PATH ??
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].find(existsSync)
if (!executablePath) throw new Error('Set CHROME_PATH to an installed Chrome/Chromium executable.')
const origin = 'http://127.0.0.1:4178'
const preview = spawn(
  process.execPath,
  [
    'node_modules/vite/bin/vite.js',
    'preview',
    '--host',
    '127.0.0.1',
    '--port',
    '4178',
    '--strictPort',
  ],
  { windowsHide: true, stdio: 'pipe' },
)
let previewOutput = ''
preview.stdout.on('data', (data) => {
  previewOutput += data
})
preview.stderr.on('data', (data) => {
  previewOutput += data
})
let browser
try {
  let ready = false
  for (let attempt = 0; attempt < 100; attempt++) {
    if (preview.exitCode !== null) throw new Error(previewOutput)
    try {
      ready = (await fetch(origin)).ok
    } catch {
      /* Wait for preview startup. */
    }
    if (ready) break
    await pause(200)
  }
  assert(ready, 'Production preview started')
  browser = await chromium.launch({ executablePath, headless: true })
  const context = await browser.newContext({ viewport: { width: 360, height: 800 } })
  const page = await context.newPage()
  page.setDefaultTimeout(12000)
  await page.clock.install()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const profile = {
    id: 1,
    username: 'emilys',
    email: 'demo@example.test',
    firstName: 'Emily',
    lastName: 'Demo',
  }
  const products = Array.from({ length: 45 }, (_, index) => ({
    id: index + 1,
    title: `${index % 2 ? 'Soap' : 'Gel'} supply ${index + 1}`,
    description: 'Stock information for clinic supplies.',
    category: index % 3 ? 'beauty' : 'groceries',
    price: index + 1,
    stock: 14,
    meta: { createdAt: '2024-01-01' },
  }))
  let failSave = false
  let failList = false
  let refreshStatus = 200
  let refreshCalls = 0
  const delays = []
  async function tokens() {
    const now = await page.evaluate(() => Date.now())
    return {
      accessToken: `header.${Buffer.from(JSON.stringify({ exp: Math.floor(now / 1000) + 60 })).toString('base64url')}.signature`,
      refreshToken: 'demo-refresh',
    }
  }
  await context.route('https://dummyjson.com/**', async (route) => {
    const url = new URL(route.request().url())
    const data = route.request().postData() ? route.request().postDataJSON() : null
    const reply = (body, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.pathname === '/auth/login') {
      assert.equal(data.expiresInMins, 1)
      return data.password === 'emilyspass'
        ? reply({ ...profile, ...(await tokens()) })
        : reply({ message: 'Invalid credentials' }, 400)
    }
    if (url.pathname === '/auth/refresh') {
      refreshCalls++
      return refreshStatus === 200
        ? reply(await tokens())
        : reply({ message: 'Refresh unavailable' }, refreshStatus)
    }
    if (url.pathname === '/auth/me') return reply(profile)
    if (url.pathname === '/products/categories')
      return reply(['beauty', 'groceries'].map((slug) => ({ slug, name: slug, url: '' })))
    if (/^\/products\/\d+$/.test(url.pathname)) {
      const product = products.find((item) => item.id === Number(url.pathname.split('/').pop()))
      if (!product) return reply({ message: 'Not found' }, 404)
      if (route.request().method() === 'PUT')
        return failSave
          ? reply({ message: 'Save unavailable' }, 500)
          : reply({ ...product, stock: data.stock })
      return reply(product)
    }
    if (failList) return reply({ message: 'List unavailable' }, 500)
    delays.push(url.searchParams.get('delay'))
    const q = (url.searchParams.get('q') ?? '').toLowerCase()
    if (url.searchParams.get('delay') === '2000') await pause(q === 'soap' ? 2000 : 300)
    const matching = products.filter((product) => product.title.toLowerCase().includes(q))
    return reply({ products: matching, total: matching.length, skip: 0, limit: matching.length })
  })
  async function login(password = 'emilyspass') {
    await page.getByLabel('Username', { exact: true }).fill('emilys')
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  }
  async function noOverflow() {
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      JSON.stringify(
        await page.evaluate(() => ({
          width: window.innerWidth,
          overflow: [...document.querySelectorAll('body *')]
            .filter((el) => el.getBoundingClientRect().right > window.innerWidth)
            .map((el) => ({
              tag: el.tagName,
              class: el.className,
              right: el.getBoundingClientRect().right,
            }))
            .slice(0, 15),
        })),
      ),
    )
  }
  await page.goto(`${origin}/items/17?from=%2F%3Fpage%3D2`)
  await page.getByRole('heading', { name: 'Sign in' }).waitFor()
  await noOverflow()
  await login('bad')
  await page.getByRole('alert').filter({ hasText: 'Invalid credentials' }).waitFor()
  await login()
  await page.getByRole('heading', { name: 'Gel supply 17' }).waitFor()
  assert(page.url().includes('/items/17?from='))
  await page.reload()
  await page.getByRole('heading', { name: 'Gel supply 17' }).waitFor()
  assert(refreshCalls >= 1, 'Reload restored session')
  await page.getByRole('button', { name: 'Correct count' }).focus()
  await page.keyboard.press('Enter')
  assert(
    await page.getByLabel('New count').evaluate((element) => document.activeElement === element),
  )
  await page.getByLabel('New count').fill('17')
  failSave = true
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Save unavailable' }).waitFor()
  assert.equal(await page.getByLabel('New count').inputValue(), '17')
  assert.equal(await page.locator('.editor__value').textContent(), '14')
  failSave = false
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByRole('status').filter({ hasText: 'Stock count saved: 17.' }).waitFor()
  await page.reload()
  await page.getByRole('heading', { name: 'Gel supply 17' }).waitFor()
  assert.equal(await page.locator('.editor__value').textContent(), '17')
  await noOverflow()
  await page.getByRole('link', { name: 'Back to stock' }).click()
  await page.getByRole('heading', { name: 'Clinic stock' }).waitFor()
  await page.waitForFunction(
    () => document.querySelector('[aria-label="Stock page"]')?.value === '2',
  )
  await page.getByLabel('Search stock').fill('Soap')
  await page.waitForFunction(
    () => document.querySelector('[aria-label="Stock page"]')?.value === '1',
  )
  await page.getByLabel('Category', { exact: true }).selectOption('beauty')
  await page.getByLabel('Sort by', { exact: true }).selectOption('price-desc')
  await page.getByRole('status').filter({ hasText: 'items found' }).waitFor()
  const savedUrl = page.url()
  await page.reload()
  await page.getByRole('status').filter({ hasText: 'items found' }).waitFor()
  assert.equal(await page.getByLabel('Search stock').inputValue(), 'Soap')
  assert.equal(await page.getByLabel('Category', { exact: true }).inputValue(), 'beauty')
  assert.equal(await page.getByLabel('Sort by', { exact: true }).inputValue(), 'price-desc')
  assert.equal(page.url(), savedUrl)
  const fresh = await context.newPage()
  await fresh.goto(savedUrl)
  await fresh.getByRole('heading', { name: 'Sign in' }).waitFor()
  await fresh.getByLabel('Username', { exact: true }).fill('emilys')
  await fresh.getByLabel('Password', { exact: true }).fill('emilyspass')
  await fresh.getByRole('button', { name: 'Sign in', exact: true }).click()
  await fresh.getByLabel('Category', { exact: true }).waitFor()
  assert.equal(await fresh.getByLabel('Category', { exact: true }).inputValue(), 'beauty')
  await fresh.close()
  await page.getByLabel('Category', { exact: true }).selectOption('groceries')
  await page.goBack()
  assert.equal(await page.getByLabel('Category', { exact: true }).inputValue(), 'beauty')
  await page.goForward()
  assert.equal(await page.getByLabel('Category', { exact: true }).inputValue(), 'groceries')
  await page.goto(`${origin}/?delay=2000`)
  await page.getByLabel('Search stock').fill('Soap')
  await page.getByLabel('Search stock').fill('Gel')
  await page.getByRole('status').filter({ hasText: 'items found' }).waitFor()
  assert(
    (await page.locator('.list__cards .card__title').allTextContents()).every((title) =>
      title.includes('Gel'),
    ),
  )
  assert(delays.includes('2000'), 'Diagnostic delay reaches API')
  await page.getByLabel('Search stock').fill('No matches whatsoever')
  await page.getByText('No matching stock', { exact: true }).waitFor()
  failList = true
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await page.getByRole('alert').filter({ hasText: 'List unavailable' }).waitFor()
  failList = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await page.getByRole('status').filter({ hasText: 'items found' }).waitFor()
  await noOverflow()
  mkdirSync('test-results', { recursive: true })
  await page.screenshot({ path: 'test-results/stock-360.png', fullPage: true })
  await page.setViewportSize({ width: 1280, height: 900 })
  assert(await page.locator('.list__table').isVisible())
  await noOverflow()
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  await noOverflow()
  await page.setViewportSize({ width: 360, height: 800 })
  await noOverflow()
  await page.evaluate(() => {
    document.documentElement.style.fontSize = ''
  })
  await page.goto(`${origin}/items/99999`)
  await page.getByText('Item not found', { exact: true }).waitFor()
  await page.goto(`${origin}/items/17`)
  await page.getByRole('heading', { name: 'Gel supply 17' }).waitFor()
  const beforeRefresh = refreshCalls
  await page.clock.fastForward(61_000)
  await page.waitForFunction(() => !document.body.textContent.includes('Refreshing your session'))
  assert(refreshCalls > beforeRefresh, 'JWT expiry triggered refresh')
  refreshStatus = 500
  await page.clock.fastForward(61_000)
  await page.getByText('Your session needs a connection', { exact: true }).waitFor()
  refreshStatus = 200
  await page.getByRole('button', { name: 'Restore session' }).click()
  await page.getByRole('heading', { name: 'Gel supply 17' }).waitFor()
  refreshStatus = 401
  await page.clock.fastForward(61_000)
  await page.getByRole('heading', { name: 'Sign in' }).waitFor()
  refreshStatus = 200
  await login()
  await page.getByRole('heading', { name: 'Gel supply 17' }).waitFor()
  assert.deepEqual(errors, [], 'No browser runtime errors')
  process.stdout.write(
    'PASS: production-browser login, invalid login, restoration, correction failure/retry, session correction persistence, combined filters, URL reload/copy/back/forward, delayed search, empty/error/retry, keyboard editor, 360px/desktop/200% text, deep links, missing item, expiry, transient/permanent refresh recovery.\n',
  )
} finally {
  await browser?.close()
  preview.kill()
}
