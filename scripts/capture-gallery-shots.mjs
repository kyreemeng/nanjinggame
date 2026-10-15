import puppeteer from 'puppeteer'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const OUT = '/opt/cursor/artifacts/ashline-marketing'
const BASE = 'http://127.0.0.1:4317/marketing/gallery.html'

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    defaultViewport: { width: 1920, height: 1080 },
  })
  const page = await browser.newPage()
  const shots = [
    { id: 7, file: '08-waterfront-skyline', caption: '滨水区与天际线俯瞰 — 营销用港区远景' },
  ]
  for (const s of shots) {
    await page.goto(`${BASE}?shot=${s.id}`, { waitUntil: 'networkidle0', timeout: 60000 })
    await page.waitForFunction('window.__ASHLINE_READY__ === true', { timeout: 30000 })
    const file = path.join(OUT, `${s.file}.png`)
    await page.screenshot({ path: file, type: 'png' })
    console.log(`CAPTURED|${file}|${s.caption}`)
  }
  await browser.close()
}

main()
