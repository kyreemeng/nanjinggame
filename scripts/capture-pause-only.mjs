import puppeteer from 'puppeteer'
import path from 'node:path'

const OUT = '/opt/cursor/artifacts/ashline-marketing'
const BASE = 'http://127.0.0.1:4317'

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    defaultViewport: { width: 1920, height: 1080 },
  })
  const page = await browser.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Start'))
    btn?.click()
  })
  await new Promise((r) => setTimeout(r, 3500))
  await page.mouse.click(960, 540)
  await new Promise((r) => setTimeout(r, 800))
  await page.keyboard.press('Escape')
  await new Promise((r) => setTimeout(r, 600))
  const file = path.join(OUT, '06-pause-menu.png')
  await page.screenshot({ path: file, type: 'png' })
  console.log('CAPTURED|' + file + '|暂停菜单 — 存档、合约与设置入口')
  await browser.close()
}

main()
