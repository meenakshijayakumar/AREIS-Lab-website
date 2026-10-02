'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

type Photo = { src: string; label: string; width: number; height: number }

export default function ResearchGallery({ photos, map, title }: { photos: Photo[]; map: string; title: string }) {
  const [mode, setMode] = useState('photos')
  const [selected, setSelected] = useState<Photo | null>(photos[0] ?? null)
  const dialog = useRef<HTMLDialogElement>(null)
  function open(photo: Photo) { setSelected(photo); dialog.current?.showModal() }
  return <>
    <div className="gallery-controls" role="group" aria-label="Image view">
      <button type="button" aria-pressed={mode === 'photos'} onClick={() => setMode('photos')}>Photographs ({photos.length})</button>
      <button type="button" aria-pressed={mode === 'map'} onClick={() => setMode('map')}>Complete research map</button>
    </div>
    {mode === 'photos' ? <div className="research-photo-grid">{photos.map(photo => <figure key={photo.src}><button type="button" onClick={() => open(photo)} aria-label={`Enlarge ${photo.label}`}><Image src={photo.src} alt={photo.label} width={photo.width} height={photo.height} sizes="(max-width: 600px) 100vw, 33vw" /><span aria-hidden="true">↗</span></button><figcaption>{photo.label}</figcaption></figure>)}</div>
      : <button className="research-map-open" type="button" onClick={() => open({ src: map, label: title, width: 2400, height: 2200 })}><Image src={map} alt={`${title}: complete research map`} width={2400} height={2200} sizes="90vw" /><span>Enlarge research map ↗</span></button>}
    <dialog className="research-lightbox" ref={dialog} aria-label={selected?.label ?? title} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }}>
      {selected && <><div className="lightbox-toolbar"><p>{selected.label}</p><a href={selected.src} target="_blank" rel="noreferrer">Original size ↗</a><button type="button" onClick={() => dialog.current?.close()} aria-label="Close image viewer">Close ×</button></div>
      <Image src={selected.src} alt={selected.label} width={selected.width} height={selected.height} sizes="95vw" /></>}
    </dialog>
  </>
}
