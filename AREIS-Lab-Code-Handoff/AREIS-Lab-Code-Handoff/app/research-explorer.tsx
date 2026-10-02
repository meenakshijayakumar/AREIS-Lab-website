import Image from 'next/image'
import Link from 'next/link'
import type { ResearchArea } from './lib/website-content'

export default function ResearchExplorer({ areas }: { areas: ResearchArea[] }) {
  return <div className="research-directory">
    {areas.map((area, index) => <Link className="research-entry" href={`/research/${area.slug}`} key={area.slug}>
      <span className="entry-number">{String(index + 1).padStart(2, '0')}</span>
      {area.gallery[0] && <Image src={area.gallery[0].src} alt={area.gallery[0].label} width={220} height={160} sizes="(max-width: 600px) 100px, 180px" />}
      <div><h3>{area.fullTitle}</h3><p>{area.text}</p><span className="entry-action">Explore research <span aria-hidden="true">↗</span></span></div>
    </Link>)}
  </div>
}
