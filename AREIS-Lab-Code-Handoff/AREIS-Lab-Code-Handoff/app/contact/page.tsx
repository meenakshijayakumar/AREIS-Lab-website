import { PageHero } from '../components/page-hero'
import { SiteFooter, SiteHeader } from '../components/site-shell'
import content from '../site-content.json'
import ContactForm from '../components/contact-form'
export default function ContactPage() { return <><SiteHeader /><PageHero label="Get in touch" title="Contact AREIS Lab." text={content.contact} /><main className="route-main contact-page"><div><p className="issue">Institution</p><h2>Khalifa University of Science and Technology</h2><p>Department of Mechanical Engineering<br />Abu Dhabi, UAE</p><p className="issue">PI email</p><p><a className="text-action" href="mailto:irfan.hussain@ku.ac.ae">irfan.hussain@ku.ac.ae ↗</a></p><p>We aim to respond within 2–3 business days.</p></div><ContactForm /></main><SiteFooter /></> }
