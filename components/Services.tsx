import Image from "next/image";
const rides = [
  {n:"01",name:"Riding lessons",lead:"Find your confidence in the saddle.",desc:"From first-time riders to those ready to grow their skills, riding lessons are personally reviewed and arranged by JD.",price:"1 hour from $85",detail:"Children 9 & under · 30 minutes · $45",image:"https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image1.jpeg",alt:"A scene from JD's Horse Ranch"},
  {n:"02",name:"Guided trail rides",lead:"Take the scenic route.",desc:"Leave the everyday behind and enjoy the natural surroundings on a guided ride for yourself, a friend, or a small group.",price:"1 rider · $85",detail:"2 riders · $160   /   3 riders · $245",image:"https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image2.jpeg",alt:"Horseback riding at JD's Horse Ranch"},
  {n:"03",name:"Special occasions",lead:"Make moments worth remembering.",desc:"Birthdays, photo shoots, video projects, and more. Share your ideas with JD to arrange the details together.",price:"Horse rental · $200 / hour",detail:"Event details personally reviewed",image:"https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image3.jpeg",alt:"A horse ranch moment in Georgia"}
];
export default function Services() {
  return <section id="experiences" className="section-space bg-white">
    <div className="wrap-wide">
      <header className="mb-12 flex flex-col justify-between gap-8 lg:mb-16 lg:flex-row lg:items-end">
        <div><p className="overline mb-5 text-[#8d7351]">Ways to ride</p><h2 className="font-editorial text-[clamp(3rem,6vw,6.3rem)] leading-[1.06] tracking-[-.055em] text-[#183329]">Your time. <em>Your experience.</em></h2></div>
        <p className="max-w-xs text-[15px] leading-7 text-[#606d63]">Choose what brings you here. Call JD to talk through your ride, available dates, and what works best for you.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        {rides.map(ride=><article key={ride.n} className="group flex flex-col border border-[#e7e2d8] bg-[#fdfcf9]">
          <div className="relative aspect-[1.23/1] overflow-hidden bg-[#d5dccf]">
            <Image src={ride.image} alt={ride.alt} fill sizes="(max-width:1024px) 100vw,33vw" className="photo-zoom object-cover"/>
            <span className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center bg-[#f9f5ea] font-editorial text-lg text-[#183329]">{ride.n}</span>
          </div>
          <div className="flex flex-1 flex-col px-6 pb-8 pt-8 sm:px-8">
            <h3 className="font-editorial text-[clamp(2rem,3vw,2.6rem)] leading-tight tracking-[-.045em] text-[#183329]">{ride.name}</h3>
            <p className="mt-4 text-[15px] font-semibold text-[#8b7454]">{ride.lead}</p>
            <p className="mt-4 flex-1 text-sm leading-7 text-[#667068]">{ride.desc}</p>
            <div className="mt-8 border-t border-[#e4dfd4] pt-5"><p className="text-sm font-bold text-[#273b30]">{ride.price}</p><p className="mt-1 text-xs leading-5 text-[#697168]">{ride.detail}</p></div>
            <a href="tel:+14049812361" className="mt-7 flex items-center justify-between border-b border-[#87978a] pb-3 text-[11px] font-bold uppercase tracking-[.14em] text-[#183329] hover:border-[#ad946b] hover:text-[#806745]">Call JD to arrange <span aria-hidden="true" className="text-lg font-normal">↗</span></a>
          </div>
        </article>)}
      </div>
      <p className="mt-7 text-center text-xs leading-6 text-[#697168]">By appointment only. Deposits are non-refundable. Rescheduling requires at least 24 hours&apos; notice and JD&apos;s approval.</p>
    </div>
  </section>;
}
