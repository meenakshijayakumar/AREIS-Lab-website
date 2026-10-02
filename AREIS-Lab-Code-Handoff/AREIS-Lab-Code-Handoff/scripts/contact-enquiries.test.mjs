import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { saveContactEnquiry } from '../app/lib/contact-enquiries.ts'

test('serializes concurrent CSV saves and safely preserves quoted, multiline enquiry text', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'areis-contact-'))
  const original = process.env.CONTACT_ENQUIRIES_PATH
  const filename = path.join(directory, 'private', 'enquiries.csv')
  process.env.CONTACT_ENQUIRIES_PATH = filename
  try {
    const enquiries = [
      { name: 'A "quoted", name', email: 'first@example.org', topic: 'Other', message: 'First line\nSecond line' },
      { name: '\t=SUM(1,2)', email: 'second@example.org', topic: 'Other', message: '\u0001 +SUM(1,2)' },
      { name: 'Third', email: 'third@example.org', topic: 'Other', message: '@formula' },
    ]
    await Promise.all(enquiries.map(saveContactEnquiry))
    const saved = await readFile(filename, 'utf8')
    assert.ok(saved.startsWith('\uFEFFID,ReceivedAtUTC,Name,Email,Topic,Message\r\n'))
    assert.equal(saved.split('ID,ReceivedAtUTC,Name,Email,Topic,Message').length, 2)
    assert.ok(saved.includes('"A ""quoted"", name","first@example.org","Other","First line\nSecond line"\r\n'))
    assert.ok(saved.includes('"\'\t=SUM(1,2)","second@example.org","Other","\'\u0001 +SUM(1,2)"\r\n'))
    assert.ok(saved.includes('"Third","third@example.org","Other","\'@formula"\r\n'))
    assert.equal(new Set(saved.match(/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/g)).size, 3)
    process.env.CONTACT_ENQUIRIES_PATH = directory
    await assert.rejects(saveContactEnquiry(enquiries[0]))
    process.env.CONTACT_ENQUIRIES_PATH = filename
    await saveContactEnquiry({ ...enquiries[0], name: 'Recovered write' })
    assert.ok((await readFile(filename, 'utf8')).includes('"Recovered write"'))
  } finally {
    if (original === undefined) delete process.env.CONTACT_ENQUIRIES_PATH
    else process.env.CONTACT_ENQUIRIES_PATH = original
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()))
    await rm(directory, { recursive: true, force: true })
  }
})
