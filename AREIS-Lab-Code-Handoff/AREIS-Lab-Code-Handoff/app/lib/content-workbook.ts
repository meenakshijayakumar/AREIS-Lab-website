import path from 'node:path'
import readExcelFile from 'read-excel-file/node'

export type Project = {
  slug: string; title: string; text: string; category: string; url: string; images: string[]
}
export type ResearchArea = {
  slug: string; title: string; fullTitle: string; text: string; details: string
  projects?: string; image: string; alt: string; coverImageOrder: number
  paragraphs: string[]; tags: string[]
  gallery: { src: string; label: string; width: number; height: number }[]
  initiatives: { name: string; text: string }[]
}
export type WebsiteContent = { projects: Project[]; researchAreas: ResearchArea[] }
export class ContentWorkbookError extends Error {}
type Sheet = { sheet: string; data: unknown[][] }
type Entry = { cells: Record<string, unknown>; location: string; order: number }

export function contentWorkbookPath() {
  return path.resolve(process.cwd(), process.env.CONTENT_WORKBOOK_PATH || 'content/areis-website-content.xlsx')
}

function fail(entry: Entry, column: string, message: string): never {
  throw new ContentWorkbookError(`${entry.location}, ${column}: ${message}`)
}

function text(entry: Entry, column: string, optional = false): string {
  const value = entry.cells[column]
  if (optional && (value === null || value === undefined || value === '')) return ''
  if (typeof value !== 'string' || !value.trim()) return fail(entry, column, 'enter text.')
  return value
}

function number(entry: Entry, column: string): number {
  const cell = entry.cells[column]
  if (typeof cell !== 'number' && typeof cell !== 'string') return fail(entry, column, 'enter a positive whole number.')
  const value = Number(cell)
  if (!Number.isSafeInteger(value) || value < 1) return fail(entry, column, 'enter a positive whole number.')
  return value
}

function slug(entry: Entry, column = 'slug') {
  const value = text(entry, column).trim().toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return fail(entry, column, 'use lowercase words separated by hyphens.')
  return value
}

function image(entry: Entry, column: string) {
  const value = text(entry, column).trim()
  let decoded: string
  try { decoded = decodeURIComponent(value) } catch { return fail(entry, column, 'invalid image path.') }
  if (!value.startsWith('/') || !decoded.startsWith('/') || decoded.startsWith('//') || /[\\?#\u0000-\u001f]/.test(decoded) || decoded.split('/').some(part => part === '..' || part === '.')) {
    return fail(entry, column, 'use a local image path such as /images/example.jpg.')
  }
  return value
}

function websiteUrl(entry: Entry) {
  const value = text(entry, 'url', true).trim()
  if (!value) return ''
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' || url.protocol === 'http:') return value
  } catch { /* Report the worksheet location below. */ }
  return fail(entry, 'url', 'use a complete https:// or http:// address, or leave blank.')
}

function rows(sheets: Sheet[], name: string, columns: string[]): Entry[] {
  const sheet = sheets.find(sheet => sheet.sheet === name)
  if (!sheet) throw new ContentWorkbookError(`Missing worksheet: ${name}. Keep the original worksheet names.`)
  const headerIndex = sheet.data.findIndex(row => row.some(cell => cell === columns[0]) && row.includes('order'))
  if (headerIndex < 0) throw new ContentWorkbookError(`${name}: missing column headings (${columns.join(', ')}).`)
  const headers = sheet.data[headerIndex].map(value => typeof value === 'string' ? value.trim() : '')
  for (const column of columns) {
    if (headers.filter(header => header === column).length !== 1) throw new ContentWorkbookError(`${name}: keep exactly one '${column}' column.`)
  }
  return sheet.data.slice(headerIndex + 1).flatMap((row, index) => {
    if (row.every(value => value === null || value === undefined || value === '')) return []
    const entry: Entry = {
      cells: Object.fromEntries(columns.map(column => [column, row[headers.indexOf(column)]])),
      location: `${name} row ${headerIndex + index + 2}`,
      order: 0,
    }
    entry.order = number(entry, 'order')
    return [entry]
  }).sort((a, b) => a.order - b.order)
}

function parents(entries: Entry[]) {
  const result = new Map<string, Entry>()
  const orders = new Set<number>()
  for (const entry of entries) {
    const key = slug(entry)
    if (result.has(key)) fail(entry, 'slug', `duplicate '${key}'. Each entry needs a unique slug.`)
    if (orders.has(entry.order)) fail(entry, 'order', `duplicate ${entry.order}. Use a different order for each entry.`)
    result.set(key, entry)
    orders.add(entry.order)
  }
  return result
}

function children(entries: Entry[], parentRows: Map<string, Entry>, column: string) {
  const result = new Map<string, Entry[]>()
  for (const entry of entries) {
    const key = slug(entry, column)
    if (!parentRows.has(key)) fail(entry, column, `'${key}' has no matching parent. Check the slug or remove its child rows.`)
    const group = result.get(key) || []
    if (group.some(other => other.order === entry.order)) fail(entry, 'order', `duplicate ${entry.order} for '${key}'.`)
    group.push(entry)
    result.set(key, group)
  }
  return result
}

export function parseContentSheets(sheets: Sheet[]): WebsiteContent {
  const projects = parents(rows(sheets, 'Projects', ['slug', 'order', 'title', 'text', 'category', 'url']))
  const research = parents(rows(sheets, 'Research', ['slug', 'order', 'title', 'fullTitle', 'text', 'details', 'projects', 'image', 'alt', 'coverImageOrder']))
  const projectImages = children(rows(sheets, 'ProjectImages', ['projectSlug', 'order', 'src']), projects, 'projectSlug')
  const paragraphs = children(rows(sheets, 'ResearchParagraphs', ['researchSlug', 'order', 'text']), research, 'researchSlug')
  const tags = children(rows(sheets, 'ResearchTags', ['researchSlug', 'order', 'tag']), research, 'researchSlug')
  const images = children(rows(sheets, 'ResearchImages', ['researchSlug', 'order', 'src', 'label', 'width', 'height']), research, 'researchSlug')
  const initiatives = children(rows(sheets, 'ResearchInitiatives', ['researchSlug', 'order', 'name', 'text']), research, 'researchSlug')

  return {
    projects: [...projects].map(([slug, entry]) => ({
      slug, title: text(entry, 'title'), text: text(entry, 'text'), category: text(entry, 'category'), url: websiteUrl(entry),
      images: (projectImages.get(slug) || []).map(entry => image(entry, 'src')),
    })),
    researchAreas: [...research].map(([slug, entry]) => {
      const gallery = images.get(slug) || []
      const coverOrder = number(entry, 'coverImageOrder')
      const coverIndex = gallery.findIndex(image => image.order === coverOrder)
      if (gallery.length && coverIndex < 0) fail(entry, 'coverImageOrder', `no ResearchImages row with order ${coverOrder} for '${slug}'.`)
      return {
        slug, title: text(entry, 'title'), fullTitle: text(entry, 'fullTitle'), text: text(entry, 'text'),
        details: text(entry, 'details'), projects: text(entry, 'projects', true) || undefined,
        image: image(entry, 'image'), alt: text(entry, 'alt'), coverImageOrder: coverIndex + 1,
        paragraphs: (paragraphs.get(slug) || []).map(entry => text(entry, 'text')),
        tags: (tags.get(slug) || []).map(entry => text(entry, 'tag')),
        gallery: gallery.map(entry => ({src: image(entry, 'src'), label: text(entry, 'label'), width: number(entry, 'width'), height: number(entry, 'height')})),
        initiatives: (initiatives.get(slug) || []).map(entry => ({ name: text(entry, 'name'), text: text(entry, 'text') })),
      }
    }),
  }
}

export async function readContentWorkbook(filename = contentWorkbookPath()) {
  return parseContentSheets(await readExcelFile(filename, { trim: false }))
}
