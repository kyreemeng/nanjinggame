/**
 * Node smoke checks (no WebGL). Run: node scripts/acceptance-smoke.mjs
 */
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const requiredScripts = ['dev', 'build']
for (const s of requiredScripts) {
  if (!pkg.scripts[s]) throw new Error(`missing npm script: ${s}`)
}

const missionDef = readFileSync('src/game/missions/missionDefinitions.ts', 'utf8')
const missionCount = (missionDef.match(/id: '/g) ?? []).length
if (missionCount < 4) throw new Error(`expected 4 missions, found ${missionCount}`)

const settingsSrc = readFileSync('src/storage/settings.ts', 'utf8')
if (!settingsSrc.includes("locale: 'en'")) throw new Error('settings missing default locale')

const messages = readFileSync('src/i18n/messages.ts', 'utf8')
if (!messages.includes("export const MESSAGES")) throw new Error('missing i18n MESSAGES export')
if (!messages.includes("'menu.language'")) throw new Error('missing i18n menu.language key')

console.log('acceptance-smoke: ok (package scripts + missions + i18n)')
