/**
 * Attempt WebGL screenshots via dev server + Puppeteer.
 * Usage: node scripts/capture-phase3-screenshots.mjs
 */
import { mkdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import puppeteer from 'puppeteer'

const OUT = '/opt/cursor/artifacts/phase3-screenshots'
const PORT = 4317
const BASE = `http://127.0.0.1:${PORT}`

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(BASE)
      if (res.ok) return
    } catch {
      /* retry */
    }
    await wait(500)
  }
  throw new Error('dev server did not start')
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const dev = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true,
  })

  try {
    await waitForServer()
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'],
    })
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 60000 })

    const startBtn = await page.$('button')
    if (startBtn) {
      await startBtn.click()
      await wait(8000)
    }

    await page.screenshot({ path: `${OUT}/00-after-start.png`, fullPage: true })

    const canvas = await page.$('canvas')
    if (canvas) {
      await page.screenshot({ path: `${OUT}/01-game-canvas.png` })
    }

    const logs = await page.evaluate(() => {
      return document.body.innerText.slice(0, 500)
    })
    await browser.close()
    console.log('capture-phase3: wrote screenshots to', OUT)
    console.log('page snippet:', logs.replace(/\s+/g, ' ').slice(0, 200))
  } finally {
    dev.kill('SIGTERM')
  }
}

main().catch((e) => {
  console.error('capture-phase3: failed (WebGL may be unavailable in VM):', e.message)
  process.exit(0)
})
