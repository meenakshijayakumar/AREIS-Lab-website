import Link from 'next/link'
import Image from 'next/image'

const links = [['Home', '/'], ['Research', '/research'], ['Projects', '/projects'], ['People', '/people'], ['Publications', '/publications'], ['News', '/news']]

export function SiteHeader() {
  return <header className="site-header"><Link className="brand" href="/" aria-label="AREIS Lab home"><Image className="areis-logo" src="/reference/images/AREIS Lab.png" alt="AREIS Lab logo" width={351} height={357} /><span className="brand-full-name">Autonomous Robotics &amp;<br />Embodied Intelligence Systems Lab</span></Link><nav aria-label="Main navigation">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<Link href="/contact">Contact</Link></nav></header>
}

export function SiteFooter() {
  return <footer><Link className="brand" href="/"><Image className="areis-logo" src="/reference/images/AREIS Lab.png" alt="AREIS Lab logo" width={351} height={357} /><span className="brand-institution">Khalifa<br />University</span></Link><p>Autonomous Robotics & Embodied Intelligence Systems Lab<br />Department of Mechanical Engineering · Abu Dhabi, UAE</p><p>© {new Date().getFullYear()} AREIS Lab</p></footer>
}
