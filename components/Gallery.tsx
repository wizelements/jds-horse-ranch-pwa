"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { GalleryPhoto } from "@/lib/types";
import { FEATURED_GUEST_PHOTOS, GUEST_PHOTO_CREDITS } from "@/lib/guestPhotos";

export default function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const existing = new Set(FEATURED_GUEST_PHOTOS.map(photo => photo.id));
  const displayPhotos = [...FEATURED_GUEST_PHOTOS, ...photos.filter(photo => !existing.has(photo.id))].slice(0, 12);
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (selected === null || !element) return;
    if (!element.open) element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [selected]);
  function close() { dialog.current?.close(); setSelected(null); }
  if (!displayPhotos.length) return null;
  const current = displayPhotos[selected ?? 0] || displayPhotos[0];
  return <section id="gallery" className="section-space overflow-hidden bg-[#1a352b] text-white">
    <div className="wrap-wide">
      <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="overline mb-6 text-[#cbb18b]">Real moments from the ranch archive</p><h2 className="font-editorial text-[clamp(3.1rem,6vw,6.2rem)] leading-[1.06] tracking-[-.055em]">See the people. <em>Feel the possibility.</em></h2></div>
        <p className="max-w-xs text-[15px] leading-7 text-[#d7dfd4]">Ranch guest photos from 2024–2025 alongside moments from the ranch archive. See the horses, riders and countryside people came to enjoy.</p>
      </div>
      <div className="grid auto-rows-[135px] grid-cols-2 gap-3 sm:auto-rows-[185px] lg:auto-rows-[215px] lg:grid-cols-4">
        {displayPhotos.map((photo, index) => <button key={photo.id} type="button" aria-label={`View photo: ${photo.title || index + 1}`} onClick={() => setSelected(index)}
          className={`group relative overflow-hidden bg-[#234336] focus-visible:z-10 ${index === 0 ? "col-span-2 row-span-2" : ""}`}>
          <Image src={photo.image_url} alt={photo.description || photo.title || "Horse ranch photograph"} fill unoptimized={!photo.image_url.startsWith("/")} sizes={index === 0 ? "(max-width:1024px) 100vw, 50vw" : "(max-width:1024px) 50vw, 25vw"} className="photo-zoom object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-[#10251b]/85 via-transparent to-transparent" aria-hidden="true" />
          <span className="absolute bottom-4 left-4 max-w-[calc(100%-4.5rem)] text-left text-xs font-semibold leading-5 tracking-[.05em] text-white drop-shadow-md sm:text-sm">{photo.title}</span>
          {GUEST_PHOTO_CREDITS[photo.id] && <span className="absolute left-3 top-3 bg-[#10251b]/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white">Guest photo · {GUEST_PHOTO_CREDITS[photo.id].date}</span>}
          <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center border border-white/75 bg-[#10251b]/40 text-xl" aria-hidden="true">↗</span>
        </button>)}
      </div>
      <div className="mt-10 flex flex-col items-start justify-between gap-6 border-t border-white/25 pt-8 md:flex-row md:items-center">
        <div><p className="overline text-[#d4b891]">Explore more guest perspectives</p><p className="mt-2 max-w-xl text-sm leading-7 text-[#d8e1d7]">Photographs show past visits, not a live view of today&apos;s horses or facilities. Browse additional guest photos on Google, then call JD about a current appointment.</p></div>
        <a href="https://www.google.com/maps/search/?api=1&amp;query=JD%27s%20Horse%20Ranch%207555%20Jones%20Rd%20Fairburn%20GA%2030213" target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-4 border border-[#d5c29f] px-6 py-4 text-xs font-bold uppercase tracking-[.14em] text-[#f4dfbe] hover:bg-white hover:text-[#153529]">See guest photos on Google <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <dialog ref={dialog} aria-label="Ranch photo viewer" onCancel={close} onClose={() => setSelected(null)} onClick={event => { if (event.target === dialog.current) close(); }}
      onKeyDown={event => {
        if (event.key === "ArrowRight") setSelected(index => ((index ?? 0) + 1) % displayPhotos.length);
        if (event.key === "ArrowLeft") setSelected(index => ((index ?? 0) + photos.length - 1) % photos.length);
      }} className="fixed inset-0 m-auto h-[95dvh] max-h-none w-[95vw] max-w-none border-0 bg-[#09130f] p-5 text-white backdrop:bg-[#09130f]/95 open:flex open:flex-col open:items-center open:justify-center sm:p-12">
      <div className="relative aspect-[4/3] max-h-[75dvh] w-full max-w-5xl">
        <Image src={current.image_url} alt={current.description || current.title || "Ranch photograph"} fill sizes="90vw" unoptimized={!current.image_url.startsWith("/")} className="object-contain" />
      </div>
      <button type="button" autoFocus onClick={close} className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center border border-white/70 bg-[#1a352b] text-xl" aria-label="Close gallery">×</button>
      <div className="mt-4 flex items-center gap-8">
        <button type="button" aria-label="Previous photo" onClick={() => setSelected(((selected ?? 0) + photos.length - 1) % photos.length)} className="px-3 py-2 text-2xl">←</button>
        <div className="max-w-[55vw] text-center"><p aria-live="polite" className="text-xs font-semibold tracking-widest">{(selected ?? 0) + 1} / {displayPhotos.length}</p><p className="mt-2 font-editorial text-lg">{current.title}</p><p className="mt-1 text-xs text-[#cdd8ce]">{current.description}</p>
        {GUEST_PHOTO_CREDITS[current.id] && <p className="mt-2 text-xs text-[#e8d8b8]">Photo: <a href={GUEST_PHOTO_CREDITS[current.id].url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{GUEST_PHOTO_CREDITS[current.id].label}</a> · {GUEST_PHOTO_CREDITS[current.id].date} · used with permission</p>}</div>
        <button type="button" aria-label="Next photo" onClick={() => setSelected(((selected ?? 0) + 1) % photos.length)} className="px-3 py-2 text-2xl">→</button>
      </div>
    </dialog>
  </section>;
}
