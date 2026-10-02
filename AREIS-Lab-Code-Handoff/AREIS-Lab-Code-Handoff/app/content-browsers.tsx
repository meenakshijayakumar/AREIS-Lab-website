'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import type content from './site-content.json'
import type { Project } from './lib/website-content'

export function ProjectBrowser({ entries }: { entries: Project[] }) {
 const [query, setQuery] = useState('')
 const [category, setCategory] = useState('All projects')
 const matches = entries.filter(p => (category === 'All projects' || p.category === category) && `${p.title} ${p.text}`.toLowerCase().includes(query.toLowerCase()))
 return <><div className="content-filters"><label>Search projects<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by topic or system" /></label><label>Project group<select value={category} onChange={e => setCategory(e.target.value)}>{['All projects', ...new Set(entries.map(p => p.category))].map(v => <option key={v}>{v}</option>)}</select></label></div><p className="result-count" aria-live="polite">{matches.length} projects</p><div className="project-catalog imported-projects">{matches.map(p => <article className="project-picture-row" key={p.slug}><div className="project-row-copy"><p className="issue">{p.category}</p><h2><Link href={`/projects/${p.slug}`}>{p.title}</Link></h2><p>{p.text}</p><Link className="text-action" href={`/projects/${p.slug}`}>View project &amp; pictures ↗</Link></div>{p.images[0] && <Link className="project-row-image" href={`/projects/${p.slug}`} aria-label={`View ${p.title}`}><Image src={p.images[0]} alt={p.title} width={1000} height={750} sizes="(max-width: 820px) 90vw, 45vw" /></Link>}</article>)}</div>{!matches.length && <p>No projects match. Try another search or research area.</p>}</>
}

export function PeopleBrowser({ entries }: { entries: typeof content.people }) {
 const [query, setQuery] = useState('')
 const [group, setGroup] = useState('All members')
 const groups = [...new Set(entries.map(p => p.group))]
 const matches = entries.filter(p => (group === 'All members' || p.group === group) && `${p.name} ${p.role}`.toLowerCase().includes(query.toLowerCase()))
 return <><div className="content-filters"><label>Search the team<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Name or role" /></label><label>Team group<select value={group} onChange={e => setGroup(e.target.value)}>{['All members', ...groups].map(v => <option key={v}>{v}</option>)}</select></label></div><p className="result-count" aria-live="polite">{matches.length} members, including alumni</p>{groups.map(g => { const people = matches.filter(p => p.group === g); return people.length ? <section className="people-group" key={g}><h2>{g}</h2><div className="team-grid">{people.map(p => <article key={p.name}>{p.image ? <Image src={p.image} alt={p.name} width={400} height={400} sizes="(max-width: 600px) 80vw, 25vw" /> : <div className="portrait-initials" aria-hidden="true">{p.name.replace(/^(Dr\.|Mr\.|Ms\.)\s*/, '').split(' ').filter(Boolean).slice(0,2).map(n => n[0]).join('')}</div>}<h3>{p.name}</h3><p>{p.role}</p>{p.url && <a href={p.url} target="_blank" rel="noreferrer">View profile ↗</a>}</article>)}</div></section> : null })}{!matches.length && <p>No matching members. Try a different name or group.</p>}</>
}

export function PublicationBrowser({ entries }: { entries: typeof content.publications }) {
 const [query, setQuery] = useState('')
 const [year, setYear] = useState('All years')
 const [page, setPage] = useState(0)
 const results = useRef<HTMLParagraphElement>(null)
 function goToPage(page: number) { setPage(page); requestAnimationFrame(() => { results.current?.focus({ preventScroll: true }); results.current?.scrollIntoView({ block: 'start', behavior: 'instant' }) }) }
 const matches = entries.filter(p => (year === 'All years' || (p.year || 'Undated') === year) && `${p.title} ${p.authors} ${p.venue}`.toLowerCase().includes(query.toLowerCase()))
 const pages = Math.ceil(matches.length / 20)
 return <><div className="content-filters"><label>Search publications<input type="search" value={query} onChange={e => {setQuery(e.target.value);setPage(0)}} placeholder="Title, author, or venue" /></label><label>Publication year<select value={year} onChange={e => {setYear(e.target.value);setPage(0)}}>{['All years', ...new Set(entries.map(p => p.year || 'Undated'))].map(v => <option key={v}>{v}</option>)}</select></label></div><p ref={results} tabIndex={-1} className="result-count publication-results" aria-live="polite">{matches.length} records{matches.length > 0 && ` · Showing ${page * 20 + 1}–${Math.min((page + 1) * 20, matches.length)}`}</p><ol className="publication-records" start={page * 20 + 1}>{matches.slice(page * 20, (page + 1) * 20).map(p => <li key={p.url}><span>{p.year || 'Undated'}</span><div><h2><a href={p.url} target="_blank" rel="noreferrer">{p.title} ↗</a></h2><p>{p.authors}</p><p className="publication-venue">{p.venue}</p></div></li>)}</ol>{!matches.length && <p>No publications match. Try another search or year.</p>}{pages > 1 && <nav className="content-pagination" aria-label="Publication pages"><button type="button" disabled={page === 0} onClick={() => goToPage(page - 1)}>← Previous</button><span>Page {page + 1} of {pages}</span><button type="button" disabled={page + 1 >= pages} onClick={() => goToPage(page + 1)}>Next →</button></nav>}</>
}
