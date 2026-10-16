import ContactForm from '../ContactForm'
import { PROFILE } from '../../data/site'

export default function Contact() {
  return (
    <div className="content contact-content">
      <h2>say hi</h2>
      <p className="muted">if you want to work together or just talk, send me a message.</p>
      <ContactForm />
      <div className="link-row">
        {PROFILE.links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label} ↗
          </a>
        ))}
      </div>
    </div>
  )
}
