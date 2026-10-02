'use client'

import { FormEvent, useRef, useState } from 'react'
import content from '../site-content.json'

export default function ContactForm() {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [pending, setPending] = useState(false)
  const submitting = useRef(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    const details = Object.fromEntries(new FormData(form))
    submitting.current = true
    setPending(true)
    setStatus('Saving your enquiry…')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || typeof result?.message !== 'string') {
        setStatus(typeof result?.message === 'string' ? result.message : 'We could not save your enquiry. Please try again, or email irfan.hussain@ku.ac.ae.')
        return
      }
      form.reset()
      setMessage('')
      setStatus('Your enquiry has been saved. Thank you for contacting AREIS Lab.')
    } catch {
      setStatus('We could not save your enquiry. Please check your connection and try again, or email irfan.hussain@ku.ac.ae.')
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return <form className="contact-form" onSubmit={submit}><label>Name<input name="name" required maxLength={120} autoComplete="name" disabled={pending} placeholder="Your name" /></label><label>Email<input name="email" type="email" required maxLength={254} autoComplete="email" disabled={pending} placeholder="you@organization.com" /></label><label>Enquiry<select name="topic" disabled={pending}>{content.enquiries.map(topic => <option key={topic}>{topic}</option>)}</select></label><label>Message<textarea name="message" value={message} onChange={(event) => setMessage(event.target.value)} required maxLength={6000} disabled={pending} placeholder="Tell us how you would like to work with the lab." /></label><p>Your details will be used to respond to your enquiry.</p><button className="button primary" type="submit" disabled={pending}>{pending ? 'Saving…' : 'Send enquiry ↗'}</button><p role="status" aria-live="polite" aria-atomic="true">{status}</p></form>
}
