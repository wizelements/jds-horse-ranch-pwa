export default function Testimonials() {
  const testimonials = [
    {
      text: "The very best I've ever experienced. The guides were so friendly, and time never rushed. The horses were so gentle, and the tour breath taking. I felt like John Wayne or Client Eastwood. Next time I'm back, I'm going to purchase cowboy boots and hat. A very great program for everyone.",
      author: "Sylvester S.",
      location: "Atlanta, GA",
    },
    {
      text: "JD is a great instructor. He makes sure everyone feels confident and safe going out on the trail. Their views are beautiful.",
      author: "Rebecca L.",
      location: "Fairburn, GA",
    },
    {
      text: "Had a great time! Everyone was so welcoming, we were taught how to properly hold the reigns and place our feet before going on the trail. Each person had a guide. We all felt very safe and everyone was so sweet.",
      author: "Akeela M.",
      location: "Atlanta, GA",
    },
    {
      text: "We had an amazing experience at JD's Horse Ranch! The staff was incredibly professional and our instructor took great care of us. We felt safe the entire time and enjoyed beautiful riding through the Georgia countryside. Highly recommend!",
      author: "Michael T.",
      location: "Marietta, GA",
    },
    {
      text: "Perfect introduction to horseback riding. JD's makes sure beginners feel confident. The trail ride was peaceful and scenic. Looking forward to coming back soon!",
      author: "Jennifer P.",
      location: "Decatur, GA",
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
            <div>
              <p className="font-semibold text-ranch-dark">- {testimonial.author}</p>
              <p className="text-sm text-gray-600">{testimonial.location}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Review Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "JD's Horse Ranch",
            review: testimonials.map((t) => ({
              "@type": "Review",
              reviewRating: {
                "@type": "Rating",
                ratingValue: "5",
              },
              author: {
                "@type": "Person",
                name: t.author,
              },
              reviewBody: t.text,
            })),
          }),
        }}
      />
    </section>
  );
}
