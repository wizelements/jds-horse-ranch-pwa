"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Do I need experience to go horseback riding at JD's Horse Ranch?",
    answer: "No experience necessary! JD's Horse Ranch offers riding lessons and trail rides for all skill levels. Whether you're a complete beginner or experienced rider, our professional instructors will ensure you feel comfortable and safe on your horse. All lessons include instruction before you ride.",
  },
  {
    question: "What are your horseback riding hours in Atlanta?",
    answer: "JD's Horse Ranch operates by appointment only. We're open 7 days a week from 8:00 AM to 6:00 PM. Call (404) 981-2361 to schedule your riding lesson or trail ride in Fairburn, GA.",
  },
  {
    question: "How much do horseback riding lessons cost?",
    answer: "Riding lessons start at $85 for 1 hour of professional instruction. Children 9 years and under can take 30-minute lessons for $45. Trail rides are $85 for 1 person, $160 for 2 people, and $245 for 3 people.",
  },
  {
    question: "What should I wear for horseback riding?",
    answer: "Wear long pants (jeans recommended), closed-toe shoes or boots, and comfortable clothing. Avoid loose or dangling items. Helmets are provided. Dress for the weather as rides are outdoors in the Georgia countryside.",
  },
  {
    question: "Is there a weight limit for horseback riding lessons?",
    answer: "Yes, we ask that riders stay within a reasonable weight range for horse safety. Please call us at (404) 981-2361 to discuss your specific needs. Our instructors will work with you to ensure a safe and enjoyable experience.",
  },
  {
    question: "Can I book a private trail ride in Atlanta?",
    answer: "Yes! JD's Horse Ranch offers guided 1-hour trail rides through beautiful natural trails near Atlanta. Trail rides are available for 1, 2, or 3 people. Call (404) 981-2361 to reserve your private trail ride experience in Fairburn.",
  },
  {
    question: "Do you offer special events and group rides?",
    answer: "Yes! JD's Horse Ranch specializes in special events including birthday parties, photo shoots, video productions, and group trail rides. 1-hour horse rentals are available for $200. Call (404) 981-2361 for custom event pricing.",
  },
  {
    question: "What's the cancellation policy for riding lessons?",
    answer: "Deposits are non-refundable. However, you can reschedule your riding lesson or trail ride up to 24 hours before your scheduled appointment. Contact us at (404) 981-2361 or jdshorseranch@gmail.com.",
  },
  {
    question: "Where is JD's Horse Ranch located?",
    answer: "JD's Horse Ranch is located at 7555 Jones Rd, Fairburn, GA 30213. We're conveniently located just outside Atlanta in the scenic Fairburn area. Visit us for horseback riding lessons and trail rides.",
  },
  {
    question: "How do I book a horseback riding lesson or trail ride?",
    answer: "Call us at (404) 981-2361 or email jdshorseranch@gmail.com to book your horseback riding lesson or trail ride. We're open 7 days a week by appointment only. Have your preferred date, time, and service ready when you call.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section bg-ranch-cream">
      <h2 className="text-4xl font-bold text-center mb-12 text-ranch-brown">
        Horseback Riding FAQ
      </h2>

      <div className="max-w-4xl mx-auto space-y-4">
        {faqItems.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
              aria-expanded={openIndex === index}
            >
              <h3 className="text-left font-semibold text-ranch-dark text-lg">
                {item.question}
              </h3>
              <span
                className={`text-ranch-brown text-xl transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
            {openIndex === index && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700 leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAQ Schema Markup for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
