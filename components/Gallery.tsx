"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
const photos = [
  {src:"https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image4.jpeg",alt:"Life at JD's Horse Ranch"},
  {src:"https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image5.jpeg",alt:"A moment from the ranch"},
  {src:"https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image6.jpeg",alt:"Ranch photography in Fairburn"},
  {src:"https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image7.jpeg",alt:"A scene from the trail"},
  {src:"https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image8.jpeg",alt:"Horses and countryside at the ranch"},
  {src:"https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image9.jpeg",alt:"A memory from JD's Horse Ranch"},
];
export default function Gallery() {
  const [selected,setSelected] = useState<number|null>(null);
  useEffect(()=>{
    if(selected===null) return;
    const key=(event:KeyboardEvent)=>{
      if(event.key==="Escape") setSelected(null);
      if(event.key==="ArrowRight") setSelected(v=>v===null?null:(v+1)%photos.length);
      if(event.key==="ArrowLeft") setSelected(v=>v===null?null:(v+photos.length-1)%photos.length);
    };
    document.addEventListener("keydown",key);
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return ()=>{document.removeEventListener("keydown",key);document.body.style.overflow=previous;};
  },[selected]);
  return <section id="gallery" className="section-space overflow-hidden bg-[#1a352b] text-white">
    <div className="wrap-wide">
      <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="overline mb-6 text-[#cbb18b]">Scenes from the ranch</p><h2 className="font-editorial text-[clamp(3.1rem,6vw,6.2rem)] leading-[1.06] tracking-[-.055em]">Out here, the <em>moments linger.</em></h2></div>
        <p className="max-w-xs text-[15px] leading-7 text-[#d7dfd4]">A few glimpses of the horses, the trails, and the experiences that bring people back.</p>
      </div>
      <div className="grid auto-rows-[135px] grid-cols-2 gap-3 sm:auto-rows-[185px] lg:auto-rows-[215px] lg:grid-cols-4">
        {photos.map((photo,i)=><button key={photo.src} type="button" aria-label={`View ranch photo ${i+1}`}
          onClick={()=>setSelected(i)}
          className={`group relative overflow-hidden bg-[#234336] focus-visible:z-10 ${i===0?"col-span-2 row-span-2":""} ${i===5?"col-span-2":""}`}>
          <Image src={photo.src} alt={photo.alt} fill sizes={i===0?"(max-width:1024px) 100vw, 50vw":"(max-width:1024px) 50vw, 25vw"} className="photo-zoom object-cover"/>
          <span className="absolute inset-0 bg-gradient-to-t from-[#10251b]/40 to-transparent transition-colors group-hover:from-[#10251b]/60" aria-hidden="true"/>
          <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center border border-white/75 text-xl text-white" aria-hidden="true">↗</span>
        </button>)}
      </div>
      <p className="mt-7 text-center text-xs uppercase tracking-[.15em] text-[#cad5ca]">A closer look at JD&apos;s Horse Ranch</p>
    </div>
    {selected!==null && <div role="dialog" aria-modal="true" aria-label="Ranch photo viewer" className="fixed inset-0 z-[90] flex items-center justify-center bg-[#09130f]/95 p-5 sm:p-12">
      <button type="button" className="absolute inset-0" onClick={()=>setSelected(null)} aria-label="Close gallery" />
      <div className="relative aspect-[4/3] w-full max-w-5xl">
        <Image src={photos[selected].src} alt={photos[selected].alt} fill sizes="100vw" className="object-contain" priority />
      </div>
      <button type="button" onClick={()=>setSelected(null)} className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center border border-white/70 bg-[#1a352b] text-xl text-white" aria-label="Close gallery">×</button>
      <div className="absolute bottom-5 flex items-center gap-8 text-white">
        <button type="button" aria-label="Previous photo" onClick={()=>setSelected((selected+photos.length-1)%photos.length)} className="px-3 py-2 text-2xl">←</button>
        <span className="text-xs font-semibold tracking-widest">{selected+1} / {photos.length}</span>
        <button type="button" aria-label="Next photo" onClick={()=>setSelected((selected+1)%photos.length)} className="px-3 py-2 text-2xl">→</button>
      </div>
    </div>}
  </section>;
}
