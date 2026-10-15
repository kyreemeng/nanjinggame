/**
 * Puppeteer + SwiftShader key-path regression.
 * Run: npm run build && npm run test:e2e
 */
import { spawn } from 'node:child_process'
import puppeteer from 'puppeteer'

const BASE = 'http://127.0.0.1:4317'
const SAVE_KEY = 'ashline-save-v2'
const SETTINGS_KEY = 'ashline-settings-v2'

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function clickButton(page, text) {
  return page.evaluate((label) => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.trim().includes(label),
    )
    btn?.click()
    return !!btn
  }, text)
}

async function clickOneOf(page, labels) {
  for (const label of labels) {
    if (await clickButton(page, label)) return label
  }
  return null
}

async function waitForHttp(url, maxMs = 60000) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      /* retry */
    }
    await wait(400)
  }
  throw new Error(`server not ready: ${url}`)
}

async function startPreview() {
  const child = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  })
  await waitForHttp(BASE)
  return child
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function testLanguageSwitch(page) {
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 90000 })
  const bootErr = await page.evaluate(() => {
    const t = document.body.innerText
    return t.includes('Could not start 3D world') || t.includes('无法启动 3D 世界')
  })
  assert(!bootErr, 'boot error UI visible on cold load')

  assert(await clickButton(page, '中文'), 'zh language button missing')
  await wait(200)
  let startZh = await page.evaluate(() =>
    [...document.querySelectorAll('button')].some((b) => b.textContent?.includes('开始游戏')),
  )
  assert(startZh, 'main menu not in Chinese after switch')

  const localeZh = await page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw).locale : null
  }, SETTINGS_KEY)
  assert(localeZh === 'zh', `expected locale zh in settings, got ${localeZh}`)

  assert(await clickButton(page, 'English'), 'en language button missing')
  await wait(200)
  const startEn = await page.evaluate(() =>
    [...document.querySelectorAll('button')].some((b) => b.textContent?.includes('Start Game')),
  )
  assert(startEn, 'main menu not in English after switch back')
}

async function bootGame(page) {
  const label = await page.evaluate(() => {
    const labels = ['Start Game', 'New Game', '开始游戏', '新游戏']
    return labels.find((l) =>
      [...document.querySelectorAll('button')].some((b) => b.textContent?.includes(l)),
    )
  })
  assert(label, 'no start button on main menu')
  await clickButton(page, label)
  await wait(3500)
  const webglOk = await page.evaluate(() => {
    const c = document.querySelector('#game-canvas')
    if (!c) return false
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    return !!gl
  })
  assert(webglOk, 'WebGL context missing after start')
}

async function main() {
  const preview = await startPreview()

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
    ],
    defaultViewport: { width: 1280, height: 720 },
  })

  const page = await browser.newPage()
  const results = {}

  try {
    await testLanguageSwitch(page)
    results.i18n = 'ok'

    await bootGame(page)

    await page.mouse.click(640, 360)
    await wait(300)
    await page.keyboard.down('KeyW')
    await wait(2000)
    await page.keyboard.up('KeyW')

    const hud = await page.evaluate(() => {
      const fpsEl = document.querySelector('.fps')
      const objective = document.querySelector('.objective p')
      return {
        fpsText: fpsEl?.textContent ?? '',
        objective: objective?.textContent ?? '',
      }
    })
    assert(hud.objective.length > 0, 'HUD objective missing')
    results.hud = hud

    await page.keyboard.press('KeyE')
    await wait(400)
    await page.keyboard.down('KeyW')
    await wait(1500)
    await page.keyboard.up('KeyW')

    await page.keyboard.press('Escape')
    await wait(500)
    const paused = await page.evaluate(() => {
      const t = document.body.innerText
      return t.includes('Paused') || t.includes('已暂停')
    })
    assert(paused, 'pause menu did not open')

    assert(await clickOneOf(page, ['Save Game', '保存游戏']), 'save button missing')
    await wait(400)

    const savePayload = await page.evaluate((key) => {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    }, SAVE_KEY)
    assert(savePayload?.version === 2, 'save missing v2')
    assert(savePayload.world?.player, 'save missing world.player')
    const savedMoney = savePayload.money
    const savedX = savePayload.world.player.x

    await page.keyboard.press('Escape')
    await wait(200)
    assert(await clickOneOf(page, ['Main Menu', '主菜单']), 'main menu button missing')
    await wait(600)

    assert(await clickOneOf(page, ['Continue', '继续游戏']), 'continue button missing')
    await wait(3500)

    const continued = await page.evaluate(
      ({ key, money, x }) => {
        const raw = localStorage.getItem(key)
        if (!raw) return { ok: false, reason: 'no save' }
        const save = JSON.parse(raw)
        const dx = Math.abs(save.world.player.x - x)
        return {
          ok: save.money === money && dx < 0.01,
          money: save.money,
          x: save.world.player.x,
        }
      },
      { key: SAVE_KEY, money: savedMoney, x: savedX },
    )
    assert(continued.ok, `continue world/money mismatch: ${JSON.stringify(continued)}`)

    await page.keyboard.press('Escape')
    await wait(300)
    await clickOneOf(page, ['Main Menu', '主菜单'])
    await wait(400)

    assert(await clickOneOf(page, ['New Game', '新游戏', 'Start Game', '开始游戏']), 'new game missing')
    await wait(3000)
    const fresh = await page.evaluate((key) => {
      const raw = localStorage.getItem(key)
      return raw
    }, SAVE_KEY)
    assert(fresh === null, 'New Game should clear save from disk')

    await page.keyboard.press('KeyM')
    await wait(400)
    const mapOpen = await page.evaluate(() => !!document.querySelector('.map-overlay'))
    assert(mapOpen, 'map overlay did not open')
    await page.keyboard.press('KeyM')
    await wait(200)

    const fps = await page.evaluate(() => {
      const el = document.querySelector('.fps')
      const m = el?.textContent?.match(/(\d+)/)
      return m ? parseInt(m[1], 10) : 0
    })
    results.fpsSwiftShader = fps

    console.log('acceptance-e2e: ok')
    console.log(JSON.stringify(results, null, 2))
  } finally {
    await browser.close()
    preview.kill('SIGTERM')
  }
}

main().catch((e) => {
  console.error('acceptance-e2e: FAIL', e.message)
  process.exit(1)
})
