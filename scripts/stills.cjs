const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

function loadPlaywright() {
  try {
    return require('playwright')
  } catch {
    const root = execSync('npm root -g').toString().trim()
    return require(path.join(root, 'playwright'))
  }
}

const BASE = process.env.STILLS_URL || 'http://127.0.0.1:5173'
const OUT = path.resolve(__dirname, '..', 'public', 'room')
const RAW = path.resolve(__dirname, '..', 'node_modules', '.stills')
const PHASES = ['night', 'dawn', 'day', 'golden', 'dusk']
const HERO = '2.3,2.0,2.6,-0.9,0.55,-2.6,66'
const SECTIONS = ['about', 'experience', 'research', 'projects', 'writing', 'contact']
const VARIANTS = ['night', 'golden']
const only = process.argv[2]

async function main() {
  const { chromium } = loadPlaywright()
  fs.mkdirSync(OUT, { recursive: true })
  fs.mkdirSync(RAW, { recursive: true })
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
  const jobs = []
  if (!only || only === 'home') for (const t of PHASES) jobs.push({ name: `home-${t}`, url: `${BASE}/preview.html?t=${t}&cam=${HERO}&dpr=2`, w: 450, h: 975, spots: t === 'night' })
  if (!only || only === 'sections') for (const s of SECTIONS) for (const t of VARIANTS) jobs.push({ name: `${s}-${t}`, url: `${BASE}/preview.html?t=${t}&shot=${s}&dpr=2`, w: 600, h: 338 })
  const spots = {}
  for (const job of jobs) {
    const page = await browser.newPage({ viewport: { width: job.w, height: job.h }, deviceScaleFactor: 2 })
    await page.goto(job.url, { waitUntil: 'load', timeout: 60000 })
    await page.waitForTimeout(9000)
    const file = path.join(RAW, `${job.name}.png`)
    await page.screenshot({ path: file, timeout: 120000 })
    if (job.spots) spots.home = await page.evaluate(() => window.__spots?.() || [])
    await page.close()
    console.log('rendered', job.name)
  }
  await browser.close()
  if (Object.keys(spots).length) {
    const labels = { cat: 'Pet the sleeping cat', catSill: 'Pet the window cat', radio: 'Play the radio', guitar: 'Strum the guitar' }
    for (const k of Object.keys(spots)) spots[k] = spots[k].map((s) => ({ ...s, label: labels[s.id] }))
    fs.writeFileSync(path.join(OUT, 'spots.json'), JSON.stringify(spots, null, 2) + '\n')
  }
  execSync(`python3 -c "
import glob, os
from PIL import Image
for f in glob.glob('${RAW}/*.png'):
    n = os.path.splitext(os.path.basename(f))[0]
    Image.open(f).convert('RGB').save('${OUT}/' + n + '.webp', 'WEBP', quality=80, method=6)
"`)
  console.log('done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
