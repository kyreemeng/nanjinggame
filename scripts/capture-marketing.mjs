import puppeteer from 'puppeteer'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const OUT = '/opt/cursor/artifacts/ashline-marketing'
const BASE = 'http://127.0.0.1:4317'
const VIEW = { width: 1920, height: 1080 }

async function wait(ms) {
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

async function shot(page, name, caption) {
  const file = path.join(OUT, `${name}.png`)
  await page.screenshot({ path: file, type: 'png' })
  console.log(`CAPTURED|${file}|${caption}`)
  return file
}

async function main() {
  await mkdir(OUT, { recursive: true })

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
    defaultViewport: VIEW,
  })

  const page = await browser.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 60000 })

  await shot(page, '01-main-menu', '主菜单 — Ashline / Harbor Row 标题与入口')

  if (await clickButton(page, 'Contracts')) {
    await wait(500)
    await shot(page, '06-contracts', '合约面板 — 四条主线任务与奖励')
    await clickButton(page, 'Back')
    await wait(300)
  }

  const startLabel = await page.evaluate(() => {
    const labels = ['Start Game', 'New Game']
    return labels.find((l) =>
      [...document.querySelectorAll('button')].some((b) => b.textContent?.includes(l)),
    )
  })
  if (startLabel) await clickButton(page, startLabel)

  await wait(3000)

  const webglOk = await page.evaluate(() => {
    const errs = document.body.innerText.includes('Could not start 3D world')
    if (errs) return false
    const c = document.querySelector('#game-canvas')
    if (!c) return false
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    return !!gl
  })

  if (!webglOk) {
    console.log('WEBGL|failed')
    await browser.close()
    return { webgl: false }
  }

  await page.mouse.click(VIEW.width / 2, VIEW.height / 2)
  await wait(1000)

  await shot(page, '02-boulevard-explore', '城市林荫大道 — 驾车探索港区尺度')

  await page.keyboard.down('KeyW')
  await wait(1500)
  await page.keyboard.up('KeyW')
  await shot(page, '03-street-on-foot', '第三人称步行 — 街道与建筑氛围')

  await page.keyboard.press('KeyE')
  await wait(600)
  await page.keyboard.down('KeyW')
  await wait(2200)
  await page.keyboard.up('KeyW')
  await shot(page, '04-driving-red-coupe', '红色轿跑驾驶 — 跟车视角')

  await shot(page, '05-hud-minimap', '游戏 HUD — 小地图、目标与时速')

  await page.keyboard.press('Escape')
  await wait(400)
  await shot(page, '06-pause-menu', '暂停菜单 — 地图、存档与设置')

  await page.keyboard.press('Escape')
  await wait(200)
  await page.keyboard.press('KeyM')
  await wait(500)
  await shot(page, '07-district-map', '全屏港区地图 — 分区路网与标记')

  await browser.close()
  return { webgl: true }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
