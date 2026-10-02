export function PageHero({ label, title, text }: { label: string; title: string; text: string }) {
  return <section className="page-hero"><p className="issue">{label}</p><h1>{title}</h1><p>{text}</p></section>
}
