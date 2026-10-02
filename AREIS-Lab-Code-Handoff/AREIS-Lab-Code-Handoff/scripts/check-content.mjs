import { access } from 'node:fs/promises'
import path from 'node:path'
import nextEnv from '@next/env'
import { contentWorkbookPath, readContentWorkbook } from '../app/lib/content-workbook.ts'

nextEnv.loadEnvConfig(process.cwd())

try {
  const content = await readContentWorkbook()
  const images = new Set([
    ...content.projects.flatMap(project => project.images),
    ...content.researchAreas.flatMap(area => [area.image, ...area.gallery.map(image => image.src)]),
  ])
  for (const image of images) {
    try { await access(path.join(process.cwd(), 'public', decodeURIComponent(image))) }
    catch { throw new Error(`Image not found in public: ${image}`) }
  }
  console.log(`Valid workbook: ${contentWorkbookPath()}\n${content.projects.length} projects, ${content.researchAreas.length} research areas, ${images.size} image paths.\nSave the workbook, then refresh the website to see your edits.`)
} catch (error) {
  console.error(`Workbook check failed: ${error.message}`)
  process.exitCode = 1
}
