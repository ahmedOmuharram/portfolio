import ContactForm from '../ContactForm'
import { PROFILE } from '../../data/site'

export default function Contact() {
  return (
    <div className="content contact-content">
      <p className="eyebrow">Contact</p>
      <h2>
        Pull up a chair, <em>say hello</em>.
      </h2>
      <p className="muted">Roles, research, collaborations, or just a good album recommendation. All inquiries welcome.</p>
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
