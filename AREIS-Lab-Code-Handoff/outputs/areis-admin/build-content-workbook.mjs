import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Workbook, SpreadsheetFile, FileBlob } from '@oai/artifact-tool';

const out = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(out, '../../AREIS-Lab-Code-Handoff');
const read = relative => fs.readFile(path.join(project, relative), 'utf8');
const content = JSON.parse(await read('app/site-content.json'));
const baseText = await read('app/research-data.ts');
const detailText = await read('app/research-content.ts');
const pageText = await read('app/research/[slug]/page.tsx');
const parseLiteral = text => JSON.parse(JSON.stringify(vm.runInNewContext('(' + text + ')', {}, { timeout: 1000 })));
const base = parseLiteral(baseText.match(/const baseAreas = ([\s\S]*?)\r?\n\r?\nexport const researchAreas/)[1]);
const detail = parseLiteral(detailText.replace(/^export const researchContent = /, '').trim());
const research = base.map((area, i) => ({ ...area, ...detail[i] }));
const initiativesLiteral = pageText.match(/<h3>Four startup initiatives<\/h3>\s*\{(\[[\s\S]*?\])\.map/)[1];
const initiatives = parseLiteral(initiativesLiteral);
const projects = content.projects;
assert.equal(projects.length, 17);
assert.equal(research.length, 5);
assert.equal(initiatives.length, 4);
for (const rows of [projects, research]) assert.equal(new Set(rows.map(r => r.slug)).size, rows.length);

const specifications = [
  {
    name: 'Projects', source: 'app/site-content.json — projects',
    headers: ['slug', 'order', 'title', 'text', 'category', 'url'],
    widths: [31, 9, 72, 108, 24, 36],
    rows: projects.map((p, i) => [p.slug, i + 1, p.title, p.text, p.category, p.url])
  },
  {
    name: 'ProjectImages', source: 'app/site-content.json — projects[].images',
    headers: ['projectSlug', 'order', 'src'],
    widths: [32, 9, 86],
    rows: projects.flatMap(p => p.images.map((src, i) => [p.slug, i + 1, src]))
  },
  {
    name: 'Research', source: 'app/research-data.ts + app/research-content.ts; cover selection: app/research/[slug]/page.tsx',
    headers: ['slug', 'order', 'title', 'fullTitle', 'text', 'details', 'projects', 'image', 'alt', 'coverImageOrder'],
    widths: [30, 9, 29, 50, 83, 83, 83, 59, 80, 21],
    rows: research.map((r, i) => [r.slug, i + 1, r.title, r.fullTitle, r.text, r.details, r.projects ?? '', r.image, r.alt, r.slug === 'wearable-robotics' ? 5 : 1])
  },
  {
    name: 'ResearchParagraphs', source: 'app/research-content.ts — paragraphs',
    headers: ['researchSlug', 'order', 'text'],
    widths: [31, 9, 119],
    rows: research.flatMap(r => r.paragraphs.map((text, i) => [r.slug, i + 1, text]))
  },
  {
    name: 'ResearchTags', source: 'app/research-content.ts — tags',
    headers: ['researchSlug', 'order', 'tag'],
    widths: [31, 9, 48],
    rows: research.flatMap(r => r.tags.map((tag, i) => [r.slug, i + 1, tag]))
  },
  {
    name: 'ResearchImages', source: 'app/research-content.ts — gallery',
    headers: ['researchSlug', 'order', 'src', 'label', 'width', 'height'],
    widths: [31, 9, 62, 34, 12, 12],
    rows: research.flatMap(r => r.gallery.map((g, i) => [r.slug, i + 1, g.src, g.label, g.width, g.height]))
  },
  {
    name: 'ResearchInitiatives', source: 'app/research/[slug]/page.tsx — Four startup initiatives',
    headers: ['researchSlug', 'order', 'name', 'text'],
    widths: [31, 9, 24, 105],
    rows: initiatives.map(([name, text], i) => ['agricultural-robotics', i + 1, name, text])
  }
];
const workbook = Workbook.create();
const instructions = workbook.worksheets.add('Instructions');
instructions.showGridLines = false;
instructions.tabColor = '#142B53';
instructions.getRange('A1:B20').format.font = { name: 'Arial', size: 10, color: '#18314F' };
instructions.getRange('A1:B20').format.verticalAlignment = 'top';
instructions.getRange('A1:A20').format.columnWidth = 25;
instructions.getRange('B1:B20').format.columnWidth = 112;
instructions.getRange('A2').values = [['AREIS Lab content']];
instructions.getRange('A2').format.font = { name: 'Arial', size: 15, bold: true, color: '#142B53' };
instructions.getRange('A3:B3').format.borders = { bottom: { style: 'thin', color: '#2563EB' } };
const notes = [
  ['Status', 'Migration export — this workbook is not yet connected to the website. Editing it will not change the website until the Microsoft 365 connection has been implemented and tested.'],
  ['Purpose', 'Shared website content for lab administrators to edit in Excel on SharePoint or OneDrive. This file contains research and projects only; contact enquiries will use a separate private store.'],
  ['Included', '17 projects; 18 project image references; 5 research areas; 17 overview paragraphs; 25 research tags; 48 research gallery images; 5 research maps; 4 startup initiatives.'],
  ['Edit content', 'Edit the text, titles, tags, captions and relative image paths in the table cells. The existing wording is copied verbatim, including source spelling and punctuation. Blank optional fields remain blank.'],
  ['Keep links stable', 'slug identifies a page. projectSlug and researchSlug link child rows to their parent. Keep existing slugs stable to preserve /projects/{slug} and /research/{slug} URLs. A new item needs a unique slug.'],
  ['Ordering', 'order is a positive integer. On Projects and Research it controls page listing order; on the child tables it controls order within the parent slug. Use distinct order values within each group.'],
  ['Adding rows', 'Add new records inside the named Excel tables so their table ranges expand. Add each image, paragraph, tag or initiative as its own child row with the matching parent slug. Do not rename tables or column headers.'],
  ['Images', 'src and image are website-relative paths such as /images/research/wearable-1.png. Preserve spaces and letter case. Image files stay in the website public folder; changing a path does not upload a new image.'],
  ['Research images', 'ResearchImages label is the existing gallery caption/alt label; width and height are the original pixel dimensions. Research image and alt describe the complete research map. coverImageOrder selects the gallery image used at the top of the detail page.'],
  ['Project images', 'ProjectImages contains the original image references and their order. The current source does not define separate project-image captions or dimensions; none have been invented.'],
  ['Research fields', 'Research text is the short introduction; details is the focus summary; projects is the optional additional-project paragraph. Longer overview paragraphs, tags and startup initiatives are in their linked tables.'],
  ['Source snapshot', 'Exported from the current website source. Each table names its source above the header. Original research claims and supplied descriptions have not been independently verified.'],
  ['Connection needed', 'Next step: choose the shared Microsoft 365 location and hosting, then implement server-side reading of this workbook with validation and refresh. Microsoft account access and permissions still need to be configured.']
];
instructions.getRange('A5:B17').values = notes;
instructions.getRange('A5:A17').format.font = { name: 'Arial', size: 10, bold: true, color: '#142B53' };
instructions.getRange('A5:B17').format.wrapText = true;
for (let i = 0; i < notes.length; i++) {
  instructions.getRange('A' + (i + 5) + ':B' + (i + 5)).format.rowHeight = 43;
  if (i % 2 === 0) instructions.getRange('A' + (i + 5) + ':B' + (i + 5)).format.fill = '#F1F6FC';
}
instructions.getRange('A5:B5').format.rowHeight = 47;

const columnName = index => { let name = ''; for (let n = index + 1; n; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + (n - 1) % 26) + name; return name; };
for (const spec of specifications) {
  const sheet = workbook.worksheets.add(spec.name);
  sheet.showGridLines = false;
  sheet.tabColor = '#3C70AF';
  const last = columnName(spec.headers.length - 1);
  const end = spec.rows.length + 4;
  const used = sheet.getRange('A1:' + last + end);
  used.format.font = { name: 'Arial', size: 10, color: '#18314F' };
  used.format.verticalAlignment = 'top';
  used.format.wrapText = true;
  sheet.getRange('A1').values = [[spec.name]];
  sheet.getRange('A1').format.font = { name: 'Arial', size: 14, bold: true, color: '#142B53' };
  sheet.getRange('A1:' + last + '1').format.rowHeight = 25;
  sheet.getRange('A2').values = [['Source: ' + spec.source]];
  sheet.getRange('A2:' + last + '2').format.wrapText = false;
  sheet.getRange('A2:' + last + '2').format.font = { name: 'Arial', size: 9, italic: true, color: '#4B6382' };
  sheet.getRange('A3:' + last + '3').format.rowHeight = 9;
  sheet.getRange('A4:' + last + end).values = [spec.headers, ...spec.rows];
  const table = sheet.tables.add('A4:' + last + end, true, spec.name + 'Table');
  table.style = 'TableStyleMedium2';
  table.showFilterButton = true;
  sheet.getRange('A4:' + last + '4').format = {
    fill: '#142B53', font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
    horizontalAlignment: 'center', verticalAlignment: 'center', rowHeight: 30,
    borders: { insideVertical: { style: 'thin', color: '#FFFFFF' } }
  };
  for (let c = 0; c < spec.widths.length; c++) sheet.getRange(columnName(c) + '1:' + columnName(c) + end).format.columnWidth = spec.widths[c];
  for (let r = 0; r < spec.rows.length; r++) {
    const row = sheet.getRange('A' + (r + 5) + ':' + last + (r + 5));
    const lines = Math.max(...spec.rows[r].map((v, c) => String(v).split('\n').reduce((n, p) => n + Math.max(1, Math.ceil(p.length / Math.max(8, spec.widths[c] * 1.08))), 0)));
    row.format.rowHeight = Math.max(29, lines * 15 + 10);
    if (r % 2 === 0) row.format.fill = '#F1F6FC';
  }
  for (let c = 0; c < spec.headers.length; c++) {
    const range = sheet.getRange(columnName(c) + '5:' + columnName(c) + end);
    const numeric = ['order', 'width', 'height', 'coverImageOrder'].includes(spec.headers[c]);
    range.format.horizontalAlignment = numeric ? 'right' : 'left';
    range.setNumberFormat(numeric ? '0' : '@');
  }
  sheet.freezePanes.freezeRows(4);
  sheet.freezePanes.freezeColumns(1);
}

function readTables(book) {
  return Object.fromEntries(specifications.map(spec => {
    const matrix = book.worksheets.getItem(spec.name).getRange('A5:' + columnName(spec.headers.length - 1) + (spec.rows.length + 4)).values;
    return [spec.name, matrix.map(values => Object.fromEntries(spec.headers.map((h, i) => [h, values[i] ?? ''])))];
  }));
}
function validate(book) {
  const t = readTables(book);
  for (const spec of specifications) {
    const expected = spec.rows.map(values => Object.fromEntries(spec.headers.map((h, i) => [h, values[i]])));
    assert.deepEqual(t[spec.name], expected, spec.name + ' values differ');
  }
  const projectRoundTrip = t.Projects.sort((a,b) => a.order-b.order).map(p => ({
    title:p.title,text:p.text,category:p.category,slug:p.slug,
    images:t.ProjectImages.filter(i => i.projectSlug===p.slug).sort((a,b)=>a.order-b.order).map(i=>i.src),url:p.url
  }));
  assert.deepEqual(projectRoundTrip, projects);
  const researchRoundTrip = t.Research.sort((a,b)=>a.order-b.order).map(r => {
    const result = { title:r.title,fullTitle:r.fullTitle,text:r.text,details:r.details };
    if (r.projects !== '') result.projects = r.projects;
    Object.assign(result, { image:r.image,alt:r.alt,slug:r.slug,
      paragraphs:t.ResearchParagraphs.filter(p=>p.researchSlug===r.slug).sort((a,b)=>a.order-b.order).map(p=>p.text),
      tags:t.ResearchTags.filter(p=>p.researchSlug===r.slug).sort((a,b)=>a.order-b.order).map(p=>p.tag),
      gallery:t.ResearchImages.filter(p=>p.researchSlug===r.slug).sort((a,b)=>a.order-b.order).map(p=>({src:p.src,label:p.label,width:p.width,height:p.height}))
    });
    return result;
  });
  assert.deepEqual(researchRoundTrip, research);
  assert.deepEqual(t.ResearchInitiatives.sort((a,b)=>a.order-b.order).map(p=>[p.name,p.text]), initiatives);
  return Object.fromEntries(specifications.map(spec=>[spec.name,spec.rows.length]));
}
workbook.recalculate();
const counts = validate(workbook);
const errors = await workbook.inspect({ kind:'match', searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options:{useRegex:true,maxResults:30}, summary:'formula error scan', maxChars:1000 });
console.log(errors.ndjson);
console.log((await workbook.inspect({kind:'sheet,table',maxChars:2500,tableMaxRows:1,tableMaxCols:2})).ndjson);
const previews = [
 ['Instructions','A1:B17'],['Projects','A1:F6'],['ProjectImages','A1:C10'],
 ['Research','A1:D9'],['Research-fields','E1:J9','Research'],
 ['ResearchParagraphs','A1:C9'],['ResearchTags','A1:C10'],['ResearchImages','A1:F10'],['ResearchInitiatives','A1:D8']
];
for (const [name, range, sheetName] of previews) {
  const blob=await workbook.render({sheetName:sheetName??name,range,scale:1,format:'png'});
  await fs.writeFile(path.join(out,name+'-preview.png'),new Uint8Array(await blob.arrayBuffer()));
  console.log('Rendered '+name);
}
const output = await SpreadsheetFile.exportXlsx(workbook);
const filename = path.join(out,'areis-website-content.xlsx');
await output.save(filename);
const reopened = await SpreadsheetFile.importXlsx(await FileBlob.load(filename));
validate(reopened);
await fs.writeFile(path.join(out,'validation.json'),JSON.stringify({counts,researchMaps:research.length,roundTrip:'All project/research/initiative source fields match after XLSX export/import',sourceFiles:['app/site-content.json','app/research-data.ts','app/research-content.ts','app/research/[slug]/page.tsx']},null,2));
console.log(JSON.stringify({filename,counts,roundTrip:'passed'},null,2));

