import Image from 'next/image'
import content from '../site-content.json'
import { PageHero } from '../components/page-hero'
import { SiteFooter, SiteHeader } from '../components/site-shell'
import { ContentNotice } from '../components/content-notice'
import { getWebsiteContent } from '../lib/website-content'
import ResearchExplorer from '../research-explorer'

export const dynamic = 'force-dynamic'

export default async function ResearchPage() {
  const { researchAreas } = await getWebsiteContent()
  return <><SiteHeader />
    <ContentNotice />
    <PageHero label="Research programme" title="Explore our research." text={`Discover the systems, experiments, and applications behind each of our ${researchAreas.length === 5 ? 'five' : researchAreas.length} research areas.`} />
    <main className="route-main research-index"><section className="reference-vision"><div><h2>Connecting physical intelligence with cognitive intelligence</h2>{content.vision.map(p => <p key={p}>{p}</p>)}</div><Image src="/reference/images/Embodied.png" alt="Embodied intelligence research framework" width={1000} height={800} /></section><ResearchExplorer areas={researchAreas} /></main>
    <SiteFooter />
  </>
}
