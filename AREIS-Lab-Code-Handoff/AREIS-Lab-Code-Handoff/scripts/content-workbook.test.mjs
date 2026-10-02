import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ContentWorkbookError, parseContentSheets } from '../app/lib/content-workbook.ts'

function workbook() {
  const sheet = (name, headers, ...rows) => ({ sheet: name, data: [[name], [], [], headers, ...rows] })
  return [
    sheet('Projects', ['slug', 'order', 'title', 'text', 'category', 'url'],
      ['second', 2, 'Second project', 'Second description', 'Category B', null],
      ['first', 1, 'First project', 'Original wording  with spaces.', 'Category A', 'https://example.com']),
    sheet('ProjectImages', ['projectSlug', 'order', 'src'], ['first', 1, '/images/First photo.jpg']),
    sheet('Research', ['slug', 'order', 'title', 'fullTitle', 'text', 'details', 'projects', 'image', 'alt', 'coverImageOrder'],
      ['research', 1, 'Research', 'Full research title', 'Summary', 'Details', null, '/images/map.png', 'Research map', 20]),
    sheet('ResearchParagraphs', ['researchSlug', 'order', 'text'], ['research', 2, 'Second paragraph'], ['research', 1, 'First paragraph']),
    sheet('ResearchTags', ['researchSlug', 'order', 'tag'], ['research', 1, 'A focus']),
    sheet('ResearchImages', ['researchSlug', 'order', 'src', 'label', 'width', 'height'],
      ['research', 20, '/images/cover.png', 'Cover', 1200, 900], ['research', 10, '/images/first.png', 'First', 640, 480]),
    sheet('ResearchInitiatives', ['researchSlug', 'order', 'name', 'text'], ['research', 1, 'Initiative', 'What it does']),
  ]
}
const row = (sheets, name, index = 4) => sheets.find(sheet => sheet.sheet === name).data[index]

test('saved edits, ordering, optional images, covers, and new routes use workbook content', () => {
  const sheets = workbook()
  const initial = parseContentSheets(sheets)
  assert.deepEqual(initial.projects.map(project => project.slug), ['first', 'second'])
  assert.equal(initial.projects[0].text, 'Original wording  with spaces.')
  assert.equal(initial.projects[1].url, '')
  assert.deepEqual(initial.projects[1].images, [])
  assert.deepEqual(initial.researchAreas[0].paragraphs, ['First paragraph', 'Second paragraph'])
  assert.equal(initial.researchAreas[0].coverImageOrder, 2)
  assert.equal(initial.researchAreas[0].gallery[1].label, 'Cover')
  assert.equal(initial.researchAreas[0].initiatives[0].text, 'What it does')
  row(sheets, 'Projects')[2] = 'Updated from Excel'
  sheets[0].data.push(['new-project', 3, 'New project', 'New description', 'Category C', ''])
  assert.equal(parseContentSheets(sheets).projects[1].title, 'Updated from Excel')
  assert.equal(parseContentSheets(sheets).projects[2].slug, 'new-project')
})

test('malformed edits report their worksheet location instead of publishing broken content', () => {
  const cases = [
    [s => { row(s, 'Projects')[0] = 'first' }, /Projects row 5, slug: duplicate/],
    [s => { row(s, 'Projects')[1] = 1 }, /Projects row 6, order: duplicate/],
    [s => { row(s, 'ProjectImages')[0] = 'missing' }, /ProjectImages row 5, projectSlug:.*no matching parent/],
    [s => { row(s, 'Projects')[5] = 'javascript:alert(1)' }, /Projects row 5, url:/],
    [s => { row(s, 'ProjectImages')[2] = '//other.example/image.png' }, /ProjectImages row 5, src:/],
    [s => { row(s, 'ProjectImages')[2] = '%2Fimages/photo.png' }, /ProjectImages row 5, src:/],
    [s => { row(s, 'ProjectImages')[2] = '/images/%2e%2e/secret' }, /ProjectImages row 5, src:/],
    [s => { row(s, 'Research')[9] = 99 }, /Research row 5, coverImageOrder:/],
    [s => { row(s, 'ResearchImages')[4] = true }, /ResearchImages row 5, width:/],
    [s => { row(s, 'ResearchImages')[5] = 0 }, /ResearchImages row 5, height:/],
    [s => { s[0].data[3][2] = 'renamed-column' }, /Projects: keep exactly one 'title'/],
    [s => { s.pop() }, /Missing worksheet: ResearchInitiatives/],
  ]
  for (const [edit, message] of cases) {
    const sheets = workbook()
    edit(sheets)
    assert.throws(() => parseContentSheets(sheets), message)
  }
})

test('mixed-case slugs link consistently and still reject duplicates and incomplete rows', () => {
  const sheets = workbook()
  sheets[0].data.push(['Hi', 18, 'Meenakshi', 'Jayakumar', 'Research Projects', ''])
  sheets[1].data.push(['HI', 1, '/images/example.png'])
  const project = parseContentSheets(sheets).projects.find(project => project.slug === 'hi')
  assert.equal(project.title, 'Meenakshi')
  assert.deepEqual(project.images, ['/images/example.png'])
  row(sheets, 'Research')[0] = 'RESEARCH'
  assert.equal(parseContentSheets(sheets).researchAreas[0].gallery.length, 2)
  sheets[0].data.push(['hi', 19, 'Duplicate', 'Description', 'Research Projects', ''])
  assert.throws(() => parseContentSheets(sheets), /duplicate 'hi'/)
  sheets[0].data.pop()
  sheets[0].data.at(-1)[4] = null
  assert.throws(() => parseContentSheets(sheets), error => error instanceof ContentWorkbookError && /Projects row 7, category: enter text/.test(error.message))
  sheets[0].data.at(-1)[4] = 'Research Projects'
  assert.equal(parseContentSheets(sheets).projects.length, 3)
})
