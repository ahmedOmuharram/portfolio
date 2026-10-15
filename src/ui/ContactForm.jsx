import { useEffect, useRef, useState } from 'react'

const ACCESS_KEY = '44ccf1a9-3663-48fe-8f29-eedb3977ae3e'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LIMIT = 2000

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [wiping, setWiping] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearInterval(timer.current), [])

  const wipe = (snapshot) => {
    setWiping(true)
    const start = Date.now()
    const duration = 1600
    timer.current = setInterval(() => {
      const k = Math.min(1, (Date.now() - start) / duration)
      const cut = (s) => s.slice(0, Math.ceil(s.length * (1 - k)))
      setForm({ name: cut(snapshot.name), email: cut(snapshot.email), message: cut(snapshot.message) })
      if (k >= 1) {
        clearInterval(timer.current)
        setWiping(false)
        setTimeout(() => setStatus('idle'), 2400)
      }
    }, 30)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return setError('Please fill in every field.')
    if (!EMAIL.test(form.email)) return setError('That email address looks off.')
    setError('')
    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: ACCESS_KEY, ...form }),
      }).then((r) => r.json())
      if (res.success) {
        setStatus('sent')
        wipe(form)
      } else {
        setStatus('idle')
        setError('Couldn’t send. Try again in a moment.')
      }
    } catch {
      setStatus('idle')
      setError('Couldn’t send. Check your connection and try again.')
    }
  }

  const change = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'message' ? value.slice(0, LIMIT) : value }))
  }

  const busy = status === 'sending' || wiping

  return (
    <form className={`contact-form${busy ? ' is-busy' : ''}`} onSubmit={submit} noValidate>
      <div className="field-row">
        <label className="field">
          <span>Name</span>
          <input name="name" value={form.name} onChange={change} placeholder="Your name" disabled={busy} autoComplete="name" />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" value={form.email} onChange={change} placeholder="name@email.com" disabled={busy} autoComplete="email" />
        </label>
      </div>
      <label className="field">
        <span>
          Message <em className="count">{form.message.length ? `${form.message.length}/${LIMIT}` : ''}</em>
        </span>
        <textarea name="message" rows={4} value={form.message} onChange={change} placeholder="I'm interested in…" disabled={busy} maxLength={LIMIT} />
      </label>
      <div className="form-foot">
        <button type="submit" className="btn btn-solid" disabled={busy}>
          {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent ✓' : 'Send message'}
        </button>
        <span className={`form-note${error ? ' is-error' : ''}`} role="status">
          {error || (status === 'sent' ? 'Thanks! I’ll get back to you soon.' : '')}
        </span>
      </div>
    </form>
  )
}
