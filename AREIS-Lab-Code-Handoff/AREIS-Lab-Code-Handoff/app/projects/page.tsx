import { PageHero } from '../components/page-hero'
import { SiteFooter, SiteHeader } from '../components/site-shell'
import { ContentNotice } from '../components/content-notice'
import { getWebsiteContent } from '../lib/website-content'
import { ProjectBrowser } from '../content-browsers'
export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
 const { projects } = await getWebsiteContent()
 return <><SiteHeader /><ContentNotice /><PageHero label="Active projects" title="Lab projects." text="Explore funded projects, research projects, and PhD student projects across agricultural robotics, marine systems, conservation, healthcare AI, and intelligent manipulation." /><main className="route-main"><ProjectBrowser entries={projects} /></main><SiteFooter /></>
}
