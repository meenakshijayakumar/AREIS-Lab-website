import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter, SiteHeader } from '../../components/site-shell'
import content from '../../site-content.json'
export function generateStaticParams() { return content.stories.map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const {slug} = await params; return {title: `${content.stories.find(p => p.slug === slug)?.title || 'News'} | AREIS Lab`} }
export default async function NewsStory({ params }: { params: Promise<{ slug: string }> }) {
 const {slug} = await params; const story = content.stories.find(s => s.slug === slug); if (!story) notFound()
 return <><SiteHeader /><main className="route-main text-detail"><Link href="/news">← News & updates</Link><p className="issue">{story.category}</p><h1>{story.title}</h1><p className="detail-lead">{story.text}</p><div className="story-photos">{story.images.map(photo => <figure key={photo.src}><a href={photo.src} target="_blank" rel="noreferrer"><Image src={photo.src} alt={photo.alt} width={1400} height={900} sizes="90vw" /></a><figcaption>{photo.alt} · Select to enlarge</figcaption></figure>)}</div>{story.url && <a className="button primary" href={story.url} target="_blank" rel="noreferrer">Read the original post ↗</a>}<div className="page-actions"><Link href="/news">← More lab news</Link></div></main><SiteFooter /></>
}
