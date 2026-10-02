import Link from 'next/link'
import content from './site-content.json'
import { SiteHeader, SiteFooter } from './components/site-shell'
import { ContentNotice } from './components/content-notice'
import { CollageGrid } from './components/collage-grid'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

const heroPhotos = [
  { src: '/images/research/agriculture-2.jpg', caption: 'Assisted pollination', alt: 'Researcher using a handheld pollination device among tomato plants in a greenhouse', position: '45% 65%', className: 'collage-pollination' },
  { src: '/images/research/agriculture-1.png', caption: 'Tactile fruit sensing', alt: 'Fingertip sensor measuring an avocado', position: '50% 52%', className: 'collage-sensing' },
  { src: '/images/research/compliant-2.png', caption: 'Compliant mechanisms', alt: 'Hands demonstrating a flexible red robotic finger prototype', position: '50% 45%', className: 'collage-compliant' },
  { src: '/images/research/healthcare-1.jpg', caption: 'Wearable robotics', alt: 'Knee exoskeleton being evaluated during treadmill walking', position: '60% 65%', className: 'collage-wearable' },
  { src: '/images/research/marine-5.png', caption: 'Underwater robotics', alt: 'Researcher preparing an underwater robot for a pool test', position: '30% 60%', className: 'collage-marine' },
  { src: '/images/research/agriculture-8.jpg', caption: 'Immersive robot control', alt: 'Researcher using a VR headset and haptic gloves alongside a mobile robot arm', position: '50% 50%', className: 'collage-teleoperation' },
]

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <ContentNotice />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="issue">Khalifa University · Abu Dhabi, UAE</p>
          <h1 className="lab-name-heading">Autonomous Robotics &amp; <i>Embodied Intelligence</i> Systems Lab</h1>
          <p className="lede">{content.hero}</p>
          <div className="hero-actions"><Link className="button primary" href="/research">Explore the work <Arrow /></Link><Link className="text-action" href="/contact">Work with the lab <Arrow /></Link></div>
        </div>
        <div className="hero-collage" role="group" aria-labelledby="collage-heading">
          <div className="collage-heading"><h2 id="collage-heading">Research <i>in action</i></h2></div>
          <CollageGrid>
            {heroPhotos.map((photo, index) => <figure className={photo.className} key={photo.src}>
              <div className="collage-photo"><Image src={photo.src} alt={photo.alt} fill sizes={index === 5 ? '(max-width: 820px) 95vw, 45vw' : '(max-width: 820px) 46vw, 23vw'} preload={index === 0} style={{ objectPosition: photo.position }} /></div>
              <figcaption>{photo.caption}</figcaption>
            </figure>)}
          </CollageGrid>
        </div>
      </section>

      <section className="manifesto">
        <div className="premise-visual"><p className="issue">Our premise</p><figure><Image src="/images/projects/humaripe-1.png" alt="HumaRipe humanoid robot assessing tomatoes through vision and tactile interaction" width={800} height={1000} sizes="(max-width: 820px) 85vw, 30vw" /><figcaption>HumaRipe: vision meets touch</figcaption></figure></div>
        <p>Intelligence is not only computed. It emerges from the continuous conversation between <em>brain, body, and environment.</em></p>
      </section>

      <section className="proof" aria-label="AREIS Lab at a glance">{content.stats.map(s => <div key={s.label}><b>{s.value}</b><span>{s.label}</span></div>)}</section>

      <section className="feature-project" id="research-vision">
        <div className="feature-image"><Image src="/images/Embodied.png" alt="Embodied intelligence framework for robotics" width={1000} height={800} /></div>
        <div className="feature-copy"><p className="issue">Research vision</p><h2>Connecting physical and cognitive intelligence.</h2><p>Traditional robotics separates mechanics from algorithms. AREIS Lab builds systems where compliant design, sensing, actuation, perception, planning, learning, and control work together.</p><Link className="button light" href="/research">Read our research vision <Arrow /></Link></div>
      </section>

      <section className="people section" id="people">
        <div className="director"><Image src="/images/Dr.Irfan.png" alt="Dr. Irfan Hussain" width={500} height={500} /><div><p className="issue">Lab director</p><h2>Dr. Irfan Hussain</h2><p>Associate Professor of Robotics and Mechanical Engineering at Khalifa University and Deputy Director of KUCARS. His research spans wearable, healthcare, marine, agricultural, and autonomous robotics.</p><a href="https://www.linkedin.com/in/irfan-hussain-353ba881/" target="_blank" rel="noreferrer">View profile <Arrow /></a></div></div>
        <div className="people-note"><p className="issue">The team</p><p>Researchers, engineers, and students across marine, agricultural, healthcare, and manipulation robotics.</p><Link className="text-action" href="/people">Meet the team &amp; alumni <Arrow /></Link></div>
      </section>

      <section className="section partner-section" id="partners"><div className="section-title"><p className="issue">Partners &amp; collaborators</p><h2>Global research &amp; industry network.</h2></div><ul className="partner-list">{content.partners.map(p => <li className={p.dark ? "partner-dark" : undefined} key={p.name}>{p.image && <Image src={p.image} alt={`${p.name} logo`} width={180} height={90} unoptimized />}<span>{p.name}</span></li>)}</ul></section>
      <section className="contact" id="contact">
        <p className="issue">Research · innovation · collaboration</p><h2>Have a problem worth solving together?</h2><p>AREIS Lab welcomes research collaborators, industry partners, prospective PhD students, and media enquiries.</p><a className="button primary" href="mailto:irfan.hussain@ku.ac.ae">Email the lab <Arrow /></a>
      </section>

      <SiteFooter />
    </main>
  )
}
