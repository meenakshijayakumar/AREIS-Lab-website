import { randomUUID } from 'node:crypto'
import { mkdir, open } from 'node:fs/promises'
import path from 'node:path'

export type ContactEnquiry = { name: string; email: string; topic: string; message: string }

function csvCell(value: string) {
  // Keep text beginning with a spreadsheet formula literal, including hidden prefixes.
  const safe = /^[\s\u0000-\u001f\u007f-\u009f]*[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safe.replaceAll('"', '""')}"`
}

// ponytail: one local server process; use a shared database when deploying multiple instances.
let pendingWrite: Promise<void> = Promise.resolve()

export function saveContactEnquiry(enquiry: ContactEnquiry) {
  const write = pendingWrite.then(async () => {
    const filename = path.resolve(process.cwd(), process.env.CONTACT_ENQUIRIES_PATH || 'data/contact-enquiries.csv')
    await mkdir(path.dirname(filename), { recursive: true })
    const file = await open(filename, 'a', 0o600)
    try {
      const header = (await file.stat()).size === 0 ? '\uFEFFID,ReceivedAtUTC,Name,Email,Topic,Message\r\n' : ''
      const values = [randomUUID(), new Date().toISOString(), enquiry.name, enquiry.email, enquiry.topic, enquiry.message]
      await file.writeFile(header + values.map(csvCell).join(',') + '\r\n', 'utf8')
      await file.sync()
    } finally {
      await file.close()
    }
  })
  pendingWrite = write.catch(() => {})
  return write
}
