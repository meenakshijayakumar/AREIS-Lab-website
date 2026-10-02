import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter, SiteHeader } from '../../components/site-shell'
import { ContentNotice } from '../../components/content-notice'
import { getWebsiteContent } from '../../lib/website-content'
import ResearchGallery from '../../research-gallery'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { researchAreas } = await getWebsiteContent()
  const area = researchAreas.find(area => area.slug === slug)
  return { title: area ? `${area.fullTitle} | AREIS Lab` : 'Research | AREIS Lab', description: area?.text }
}

export default async function ResearchDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { researchAreas, contentWarning } = await getWebsiteContent()
  if (contentWarning && !researchAreas.length) return <><SiteHeader /><ContentNotice /><SiteFooter /></>
  const area = researchAreas.find(area => area.slug === slug)
  if (!area) notFound()
  const index = researchAreas.indexOf(area)
  const next = researchAreas.length > 1 ? researchAreas[(index + 1) % researchAreas.length] : undefined
  const cover = area.gallery[area.coverImageOrder - 1] ?? area.gallery[0]
  return <><SiteHeader /><ContentNotice /><main className="research-article">
    <nav className="research-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/research">Research</Link><span>/</span><span aria-current="page">{area.title}</span></nav>
    <header className="research-opening">
      <div><p className="issue">AREIS Lab · Research area {index + 1} of {researchAreas.length}</p><h1>{area.fullTitle}</h1><p className="research-deck">{area.text}</p><a className="article-jump" href="#research-overview">Discover the programme ↓</a></div>
      {cover && <figure><Image src={cover.src} alt={cover.label} width={cover.width} height={cover.height} sizes="(max-width: 820px) 100vw, 45vw" priority /><figcaption>{cover.label}</figcaption></figure>}
    </header>
    <div className="research-reading">
      <aside className="research-contents"><p>On this page</p><nav aria-label="Page sections"><a href="#research-overview">Overview</a><a href="#research-focus">Research focus</a><a href="#research-gallery">Systems & experiments</a></nav><Link href="/research">← All research areas</Link></aside>
      <div className="research-body">
        <section id="research-overview"><h2>Research overview</h2>{area.paragraphs.map(p => <p key={p}>{p}</p>)}</section>
        <section id="research-focus"><h2>Research focus</h2><p>{area.details}</p>{area.projects && <p>{area.projects}</p>}<ul className="research-topics">{area.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
        {area.initiatives.length > 0 && <div className="startup-details">
          <h3>{area.initiatives.length} startup {area.initiatives.length === 1 ? 'initiative' : 'initiatives'}</h3>
          {area.initiatives.map(({name, text}) => <details key={name}><summary>{name}<span aria-hidden="true">+</span></summary><p>{text}</p></details>)}
        </div>}
        </section>
      </div>
    </div>
    <section className="research-visuals" id="research-gallery"><div className="visuals-heading"><h2>Systems & experiments</h2><p>Explore individual photographs or view the complete research map.</p></div><ResearchGallery photos={area.gallery} map={area.image} title={area.fullTitle} /></section>
    <nav className="research-next" aria-label="More research"><Link href="/research">← Research directory</Link>{next && <Link href={`/research/${next.slug}`}><span>Next research area</span><strong>{next.title} ↗</strong></Link>}</nav>
  </main><SiteFooter /></>
}
