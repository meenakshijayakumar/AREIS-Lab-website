import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter, SiteHeader } from '../../components/site-shell'
import { ContentNotice } from '../../components/content-notice'
import { getWebsiteContent } from '../../lib/website-content'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params
 const { projects } = await getWebsiteContent()
 return { title: `${projects.find(p => p.slug === slug)?.title || 'Project'} | AREIS Lab` }
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
 const {slug} = await params
 const { projects, contentWarning } = await getWebsiteContent()
 if (contentWarning && !projects.length) return <><SiteHeader /><ContentNotice /><SiteFooter /></>
 const p = projects.find(p => p.slug === slug); if (!p) notFound()
 const next = projects.length > 1 ? projects[(projects.indexOf(p) + 1) % projects.length] : undefined
 return <><SiteHeader /><ContentNotice /><main className="route-main project-detail"><Link href="/projects">← All projects</Link><header className="project-detail-opening"><div><p className="issue">{p.category}</p><h1>{p.title}</h1><h2>About the project</h2><p className="detail-lead">{p.text}</p>{p.url && <a className="text-action" href={p.url} target="_blank" rel="noreferrer">Visit project website ↗</a>}</div>{p.images[0] && <figure><a href={p.images[0]} target="_blank" rel="noreferrer" aria-label="Open project picture at full size"><Image src={p.images[0]} alt={p.title} width={1200} height={900} sizes="(max-width: 820px) 90vw, 45vw" priority /></a><figcaption>Select the picture to view full size.</figcaption></figure>}</header>{p.images.slice(1).map((image, i) => <figure className="additional-project-image" key={image}><a href={image} target="_blank" rel="noreferrer"><Image src={image} alt={`${p.title}: additional view ${i + 1}`} width={1400} height={900} sizes="90vw" /></a></figure>)}<div className="page-actions"><Link className="button primary" href="/contact">Discuss this project ↗</Link></div><nav className="research-next" aria-label="Project navigation"><Link href="/projects">← Project directory</Link>{next && <Link href={`/projects/${next.slug}`}><span>Next project</span><strong>{next.title} ↗</strong></Link>}</nav></main><SiteFooter /></>
}
