export default function Testimonials() {
  const testimonials = [
    {
      text: "The very best I've ever experienced. The guides were so friendly, and time never rushed. The horses were so gentle, and the tour breath taking. I felt like John Wayne or Client Eastwood. Next time I'm back, I'm going to purchase cowboy boots and hat. A very great program for everyone.",
      author: "Sylvester S.",
    },
    {
      text: "JD is a great instructor. He makes sure everyone feels confident and safe going out on the trail. Their views are beautiful.",
      author: "Rebecca L.",
    },
    {
      text: "Had a great time! Everyone was so welcoming, we were taught how to properly hold the reigns and place our feet before going on the trail. Each person had a guide. We all felt very safe and everyone was so sweet.",
      author: "Akeela M.",
    },
  ];

  return (
    <section className="section bg-white">
      <h2 className="text-4xl font-bold text-center mb-12 text-ranch-brown">
        What Our Customers Are Saying
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, idx) => (
          <div key={idx} className="service-card border-l-4 border-ranch-brown">
            <p className="text-gray-700 mb-4 italic">&quot;{testimonial.text}&quot;</p>
            <p className="font-semibold text-ranch-dark">- {testimonial.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
