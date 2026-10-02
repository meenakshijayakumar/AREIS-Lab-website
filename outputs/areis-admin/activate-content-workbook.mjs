import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
const dir = path.dirname(fileURLToPath(import.meta.url));
const original = path.join(dir, 'areis-website-content.xlsx');
const target = path.resolve(dir, '../../AREIS-Lab-Code-Handoff/content/areis-website-content.xlsx');
const originalBytes = await fs.readFile(original);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(original));
const ranges = {
  Projects:'A1:F21',ProjectImages:'A1:C22',Research:'A1:J9',
  ResearchParagraphs:'A1:C21',ResearchTags:'A1:C29',
  ResearchImages:'A1:F52',ResearchInitiatives:'A1:D8'
};
const snapshot = Object.fromEntries(Object.entries(ranges).map(([name,range]) => [name, wb.worksheets.getItem(name).getRange(range).values]));
if (process.argv.includes('--preview')) {
  console.log((await wb.inspect({kind:'table',sheetId:'Instructions',range:'A5:B17',maxChars:1700,tableMaxRows:2,tableMaxCols:2})).ndjson);
  const png=await wb.render({sheetName:'Instructions',range:'A1:B17',scale:1,format:'png'});
  await fs.writeFile(path.join(dir,'Instructions-before-live.png'),new Uint8Array(await png.arrayBuffer()));
  console.log('Rendered original Instructions.');
} else {
  const sheet=wb.worksheets.getItem('Instructions');
  const updates = {
    B5:'Live local content source — this workbook supplies the website research and project pages. Save your edits in Excel, then refresh the website to see them.',
    B6:'Active file: content/areis-website-content.xlsx inside the website project. This workbook manages research and projects only. No upload or SharePoint/OneDrive automatic synchronization is configured.',
    B8:'Edit titles, text, tags, captions and relative image paths in the table cells. Save this active workbook, then refresh the website. Keep optional fields blank when unused. Do not edit the older migration export.',
    A17:'Validate edits',
    B17:'Run npm run content:check from the website project folder after editing. Fix any reported issues before using the content. Keep stable slugs, valid parent references and distinct positive order values within each group.'
  };
  for (const [cell,value] of Object.entries(updates)) sheet.getRange(cell).values=[[value]];
  wb.recalculate();
  for (const [name,range] of Object.entries(ranges)) assert.deepEqual(wb.worksheets.getItem(name).getRange(range).values,snapshot[name],name);
  const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:10},maxChars:500});
  console.log(errors.ndjson);
  const png=await wb.render({sheetName:'Instructions',range:'A1:B17',scale:1,format:'png'});
  await fs.writeFile(path.join(dir,'Instructions-live-preview.png'),new Uint8Array(await png.arrayBuffer()));
  await fs.mkdir(path.dirname(target),{recursive:true});
  const file=await SpreadsheetFile.exportXlsx(wb);
  await file.save(target);
  const reopened=await SpreadsheetFile.importXlsx(await FileBlob.load(target));
  for (const [name,range] of Object.entries(ranges)) assert.deepEqual(reopened.worksheets.getItem(name).getRange(range).values,snapshot[name],name+' after export');
  for (const [cell,value] of Object.entries(updates)) assert.equal(reopened.worksheets.getItem('Instructions').getRange(cell).values[0][0],value);
  assert.equal(hash(await fs.readFile(original)),hash(originalBytes));
  console.log(JSON.stringify({target,originalUnchanged:true,dataSheetsUnchanged:Object.keys(ranges),updatedCells:Object.keys(updates)},null,2));
}

