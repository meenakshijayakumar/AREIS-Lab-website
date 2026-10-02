import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import { ContentWorkbookError } from '../app/lib/content-workbook.ts'

const source = ts.transpileModule(readFileSync(new URL('../app/lib/website-content.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

// Exercise the real loader with a controlled file reader; React cache is request-scoped.
function loader(mode) {
  let result = { projects: [{ slug: 'existing' }], researchAreas: [] }
  const exports = {}
  vm.runInNewContext(source, {
    exports,
    process: { env: { NODE_ENV: mode } },
    console: { error() {} },
    require(name) {
      if (name === 'server-only') return {}
      if (name === 'react') return { cache: fn => fn }
      if (name === './content-workbook') return {
        ContentWorkbookError,
        contentWorkbookPath: () => 'private/workbook.xlsx',
        async readContentWorkbook() { if (result instanceof Error) throw result; return result },
      }
      throw new Error(`Unexpected import ${name}`)
    },
  })
  return { read: exports.getWebsiteContent, set: value => { result = value } }
}

test('local validation errors are visible, retain prior content, and clear after correction', async () => {
  const content = loader('development')
  await content.read()
  content.set(new ContentWorkbookError('Projects row 22, category: enter text.'))
  const invalid = await content.read()
  assert.equal(invalid.projects[0].slug, 'existing')
  assert.match(invalid.contentWarning, /Projects row 22, category: enter text/)
  assert.match(invalid.contentWarning, /previous valid content/)
  content.set({ projects: [{ slug: 'hi' }], researchAreas: [] })
  const corrected = await content.read()
  assert.equal(corrected.projects[0].slug, 'hi')
  assert.equal(corrected.contentWarning, undefined)
  content.set(new Error('ENOENT: C:/private/personal/workbook.xlsx'))
  const unavailable = await content.read()
  assert.match(unavailable.contentWarning, /could not be read/)
  assert.ok(!unavailable.contentWarning.includes('C:/private'))
})

test('a local first-load error still has a notice; production keeps diagnostics private', async () => {
  const local = loader('development')
  local.set(new ContentWorkbookError('Projects row 22, category: enter text.'))
  assert.equal((await local.read()).projects.length, 0)
  assert.match((await local.read()).contentWarning, /Projects row 22/)
  const production = loader('production')
  await production.read()
  production.set(new ContentWorkbookError('Projects row 22, category: enter text.'))
  assert.equal((await production.read()).contentWarning, undefined)
  assert.equal((await production.read()).projects[0].slug, 'existing')
  const unavailable = loader('production')
  unavailable.set(new Error('ENOENT: C:/private/personal/workbook.xlsx'))
  await assert.rejects(unavailable.read(), /The content workbook could not be loaded/)
})
