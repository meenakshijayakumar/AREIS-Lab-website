import content from '../../site-content.json'
import { saveContactEnquiry } from '../../lib/contact-enquiries'
import type { ContactEnquiry } from '../../lib/contact-enquiries'

export const runtime = 'nodejs'

function reply(message: string, status: number) {
  return Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const origin = new URL(request.url)
  origin.host = request.headers.get('host') || origin.host
  if (request.headers.get('origin') !== origin.origin) return reply('Please submit your enquiry from this website.', 403)
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return reply('Please submit the contact form as JSON.', 415)
  }

  let body: unknown
  const reader = request.body?.getReader()
  if (!reader) return reply('Please complete the contact form.', 400)
  try {
    const chunks: Uint8Array[] = []
    let bytes = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > 32 * 1024) {
        await reader.cancel()
        return reply('Your enquiry is too long. Please shorten your message.', 413)
      }
      chunks.push(value)
    }
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return reply('The enquiry could not be read. Please try again.', 400)
  } finally {
    reader.releaseLock()
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) return reply('Please complete the contact form.', 400)
  const fields = body as Record<string, unknown>
  const enquiry = {} as ContactEnquiry
  for (const [field, maximum] of Object.entries({ name: 120, email: 254, topic: 120, message: 6000 })) {
    const value = fields[field]
    if (typeof value !== 'string' || !value.trim() || value.length > maximum) {
      return reply(`Please enter a ${field} of no more than ${maximum} characters.`, 400)
    }
    enquiry[field as keyof ContactEnquiry] = value.trim()
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) return reply('Please enter a valid email address.', 400)
  if (!content.enquiries.includes(enquiry.topic)) return reply('Please choose an enquiry topic from the form.', 400)

  try {
    await saveContactEnquiry(enquiry)
    return reply('Your enquiry has been saved. Thank you for contacting AREIS Lab.', 201)
  } catch {
    console.error('Contact enquiry could not be saved. Check server storage access.')
    return reply('We could not save your enquiry. Please try again, or email irfan.hussain@ku.ac.ae.', 503)
  }
}
