import { PageHero } from '../components/page-hero'
import { SiteFooter, SiteHeader } from '../components/site-shell'
import content from '../site-content.json'
import Image from 'next/image'
import Link from 'next/link'
export default function NewsPage() { return <><SiteHeader /><PageHero label="News" title="News & updates." text="Achievements, media coverage, conference highlights, and lab announcements." /><main className="route-main"><article className="news-feature"><p className="issue">{content.stories[0].category}</p><h2>{content.stories[0].title}</h2><p>{content.stories[0].text}</p><Link className="text-action" href={`/news/${content.stories[0].slug}`}>Read the story ↗</Link></article><div className="news-grid">{content.stories.slice(1).map(s => <article key={s.slug}><Link href={`/news/${s.slug}`}><Image src={s.images[0].src} alt={s.images[0].alt} width={900} height={600} sizes="(max-width: 700px) 100vw, 50vw" /></Link><div><p className="issue">{s.category}</p><h2><Link href={`/news/${s.slug}`}>{s.title}</Link></h2><p>{s.text}</p><Link className="text-action" href={`/news/${s.slug}`}>Read story & view photos ↗</Link></div></article>)}</div></main><SiteFooter /></> }
