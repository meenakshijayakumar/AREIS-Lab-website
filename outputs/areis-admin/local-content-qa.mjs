import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { spawn, execFileSync } from 'node:child_process'

const [project, dependencies, chrome, python] = process.argv.slice(2)
const require = createRequire(import.meta.url)
const { chromium } = require(path.join(dependencies, 'playwright'))
const { readContentWorkbook } = await import(pathToFileURL(path.join(project, 'app/lib/content-workbook.ts')))
const original = path.join(project, 'content/areis-website-content.xlsx')
const originalHash = fs.readFileSync(original)
const output = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'areis-content-qa-'))
const workbook = path.join(temporary, 'content.xlsx')
const enquiries = path.join(temporary, 'enquiries.csv')
fs.copyFileSync(original, workbook)
const initial = await readContentWorkbook(original)
const base = 'http://localhost:3001'
let serverLog = ''
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', '3001'], {
  cwd: project, env: { ...process.env, CONTENT_WORKBOOK_PATH: workbook, CONTACT_ENQUIRIES_PATH: enquiries }, windowsHide: true,
  stdio: ['ignore', 'pipe', 'pipe'],
})
server.stdout.on('data', data => { serverLog += data })
server.stderr.on('data', data => { serverLog += data })
let browser
const report = { routes: [], liveEdits: [], contacts: [], layouts: [], browserErrors: [] }
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const edit = code => execFileSync(python, ['-c', `import openpyxl,sys\np=sys.argv[1]\nw=openpyxl.load_workbook(p)\n${code}\nw.save(p)`, workbook], { windowsHide: true })

try {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (server.exitCode !== null) throw new Error(serverLog)
    try { if ((await fetch(base + '/projects')).status === 200) break } catch { /* Wait for startup. */ }
    if (attempt === 39) throw new Error('Test server did not become ready: ' + serverLog)
    await wait(500)
  }
  for (const route of ['/', '/research', '/projects', '/people', '/publications', '/news', '/contact',
    ...initial.projects.map(project => '/projects/' + project.slug),
    ...initial.researchAreas.map(area => '/research/' + area.slug)]) {
    const response = await fetch(base + route)
    assert.equal(response.status, 200, route)
    await response.text()
    report.routes.push({ route, status: response.status })
  }

  browser = await chromium.launch({ executablePath: chrome, headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', error => report.browserErrors.push(error.message))
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of ['/', '/projects', '/research', '/projects/touchripe', '/research/wearable-robotics', '/contact']) {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      const layout = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }))
      assert.ok(layout.scroll <= layout.width, `${route} overflows at ${width}: ${JSON.stringify(layout)}`)
      report.layouts.push({ route, width, ...layout })
      if (route === '/projects' || route === '/research/wearable-robotics' || route === '/contact') {
        await page.screenshot({ path: path.join(output, `local-content-${route.replaceAll('/', '-')}-${width}.png`) })
      }
    }
  }
  await page.goto(base + '/projects')
  await page.getByRole('searchbox', { name: 'Search projects', exact: true }).fill('TouchRIPE')
  assert.equal(await page.locator('.project-picture-row').count(), 1)
  await page.goto(base + '/research/wearable-robotics')
  await page.getByRole('button', { name: /Enlarge / }).first().click()
  assert.equal(await page.locator('dialog').evaluate(dialog => dialog.open), true)
  await page.getByRole('button', { name: 'Close image viewer' }).click()
  await page.getByRole('button', { name: 'Complete research map', exact: true }).click()
  assert.equal(await page.locator('.research-map-open').count(), 1)

  edit(`w['Projects']['C5']='Excel live project edit'\nw['Projects']['D5']='Saved project description from Excel.'\nw['Research']['D5']='Excel live research edit'\nw['ResearchParagraphs']['C5']='Saved research paragraph from Excel.'\nw['ResearchInitiatives']['C5']='Excel initiative edit'\nw['Projects'].append(['excel-new-project',999,'Excel new project','New project description','Test category',''])\nw['Research'].append(['excel-new-research',999,'New research','Excel new research','New summary','New details','', '/images/research/wearable-map.png','Research map',1])`)
  await page.goto(base + '/projects/' + initial.projects[0].slug)
  assert.equal(await page.locator('h1').innerText(), 'Excel live project edit')
  assert.ok((await page.locator('main').innerText()).includes('Saved project description from Excel.'))
  await page.goto(base + '/research/' + initial.researchAreas[0].slug)
  assert.equal(await page.locator('h1').innerText(), 'Excel live research edit')
  assert.ok((await page.locator('main').innerText()).includes('Saved research paragraph from Excel.'))
  for (const route of ['/', '/projects', '/research', '/research/agricultural-robotics', '/projects/excel-new-project', '/research/excel-new-research']) {
    const response = await fetch(base + route)
    assert.equal(response.status, 200, route)
    const html = await response.text()
    if (route === '/') assert.ok(html.includes('Excel live project edit') && html.includes('Excel live research edit'))
    if (route === '/projects') assert.ok(html.includes('Excel new project'))
    if (route === '/research') assert.ok(html.includes('Excel new research'))
    if (route === '/research/agricultural-robotics') assert.ok(html.includes('Excel initiative edit'))
  }
  report.liveEdits.push('Saved project/research text, homepage, initiatives and new detail routes updated without rebuild/restart.')

  edit(`w['Projects']['A5']='invalid slug'`)
  assert.equal((await fetch(base + '/projects')).status, 200)
  assert.ok((await (await fetch(base + '/projects')).text()).includes('Excel live project edit'))
  assert.ok(serverLog.includes('Serving the last valid content'))
  report.liveEdits.push('Invalid workbook retained last valid content and logged an actionable error.')
  fs.copyFileSync(original, workbook)
  await page.goto(base + '/projects/' + initial.projects[0].slug)
  assert.equal(await page.locator('h1').innerText(), initial.projects[0].title)
  assert.equal((await fetch(base + '/projects/excel-new-project')).status, 404)
  assert.equal((await fetch(base + '/research/excel-new-research')).status, 404)
  report.liveEdits.push('Restoring workbook restored content and removed temporary routes without restart.')

  await page.goto(base + '/contact')
  await page.getByLabel('Name', { exact: true }).fill('Local QA Example')
  await page.getByLabel('Email', { exact: true }).fill('qa@example.com')
  await page.getByLabel('Message', { exact: true }).fill('Synthetic local test enquiry; no real personal information.')
  const saved = page.waitForResponse(response => response.url().endsWith('/api/contact') && response.request().method() === 'POST')
  await page.getByRole('button', { name: /(?:Send|Submit) enquiry/i }).click()
  assert.ok((await saved).ok())
  await page.waitForFunction(() => document.querySelector('input[name="name"]').value === '')
  assert.match(await page.locator('.contact-form').innerText(), /saved/i)
  const post = (body, headers = {}) => fetch(base + '/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, ...headers }, body: JSON.stringify(body) })
  const valid = { name: 'Example, "Tester"', email: 'qa@example.com', topic: 'Research Collaboration', message: '=1+1\nSecond line with "quotes", commas and العربية.' }
  const concurrent = await Promise.all(Array.from({ length: 4 }, () => post(valid)))
  assert.ok(concurrent.every(response => response.ok))
  const csvRows = () => JSON.parse(execFileSync(python, ['-c', 'import csv,json,sys; print(json.dumps(list(csv.reader(open(sys.argv[1],encoding="utf-8-sig",newline="")))))', enquiries], { encoding: 'utf8', windowsHide: true }))
  const rows = csvRows()
  assert.equal(rows.length, 6)
  assert.equal(new Set(rows.slice(1).map(row => row[0])).size, 5)
  assert.equal(rows[2][2], 'Example, "Tester"')
  assert.ok(rows[2][5].startsWith("'=1+1"))
  assert.ok(rows[2][5].includes('العربية.'))
  assert.equal((await post({ ...valid, email: 'invalid' })).status, 400)
  assert.equal((await post({ ...valid, topic: 'Invalid topic' })).status, 400)
  assert.equal((await post({ ...valid, message: 'x'.repeat(6001) })).status, 400)
  assert.equal((await post({ ...valid, message: 'x'.repeat(33000) })).status, 413)
  assert.equal((await fetch(base + '/api/contact', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: '{' })).status, 400)
  assert.equal((await post(valid, { 'Content-Type': 'text/plain' })).status, 415)
  assert.equal((await post(valid, { Origin: 'https://unrelated.example' })).status, 403)
  assert.equal((await fetch(base + '/api/contact')).status, 405)
  assert.equal((await fetch(base + '/data/contact-enquiries.csv')).status, 404)
  assert.equal(csvRows().length, 6)
  report.contacts.push('Browser submission persisted, confirmed and reset; concurrent submissions created one header and complete distinct records; CSV quotes, Unicode and formula protection passed.')
  report.contacts.push('Invalid and cross-origin submissions rejected; saved CSV has no public endpoint.')

  fs.renameSync(enquiries, enquiries + '.backup')
  fs.mkdirSync(enquiries)
  try {
    await page.getByLabel('Name', { exact: true }).fill('Preserve me')
    await page.getByLabel('Email', { exact: true }).fill('qa@example.com')
    await page.getByLabel('Message', { exact: true }).fill('Please retain this message after a save failure.')
    const failed = page.waitForResponse(response => response.url().endsWith('/api/contact') && response.request().method() === 'POST')
    await page.getByRole('button', { name: /(?:Send|Submit) enquiry/i }).click()
    assert.equal((await failed).status(), 503)
    assert.equal(await page.getByLabel('Name', { exact: true }).inputValue(), 'Preserve me')
    assert.equal(await page.locator('textarea[name="message"]').inputValue(), 'Please retain this message after a save failure.')
    report.contacts.push('Storage failure returned 503 and preserved all form input.')
  } finally {
    fs.rmdirSync(enquiries)
    fs.renameSync(enquiries + '.backup', enquiries)
  }
  assert.deepEqual(report.browserErrors, [])
  assert.deepEqual(fs.readFileSync(original), originalHash)
  fs.writeFileSync(path.join(output, 'local-content-qa.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} finally {
  if (browser) await browser.close()
  server.kill()
  fs.rmSync(workbook, { force: true })
  fs.rmSync(enquiries, { force: true })
  fs.rmdirSync(temporary)
}
