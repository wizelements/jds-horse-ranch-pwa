"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Do I need experience to go horseback riding at JD's Horse Ranch?",
    answer:
      "No experience is necessary. JD's Horse Ranch welcomes first-time and experienced riders. When you start your request on WhatsApp, share each rider's experience so JD can review the request and prepare appropriately.",
  },
  {
    question: "What are your horseback riding hours?",
    answer:
      "JD's Horse Ranch operates by appointment only. Start your request through the WhatsApp reservation assistant and send the date and approximate time you prefer. JD reviews availability before anything is confirmed.",
  },
  {
    question: "How much do horseback riding lessons cost?",
    answer:
      "Riding lessons start at $85 for 1 hour. Children 9 years and under can take 30-minute lessons for $45. The final time and amount are confirmed by JD before any payment request is sent.",
  },
  {
    question: "What should I wear for horseback riding?",
    answer:
      "Wear long pants, closed-toe shoes or boots, and comfortable clothing suitable for the weather. Avoid loose or dangling items. If JD has additional preparation instructions for your appointment, they will be sent in your WhatsApp conversation.",
  },
  {
    question: "How is rider size and horse fit handled?",
    answer:
      "The reservation assistant asks for each rider's age, height, and weight so JD has the information needed to review rider and horse fit. The assistant does not make an automatic safety decision; JD reviews the request before approval.",
  },
  {
    question: "Can I request a private trail ride?",
    answer:
      "Yes. Guided trail rides are available for 1, 2, or 3 riders. Choose Trail Ride on WhatsApp, provide the rider details and preferred date, and JD will review the request.",
  },
  {
    question: "Do you offer special events and group experiences?",
    answer:
      "Yes. JD's Horse Ranch can consider birthday parties, photo shoots, video productions, and other special events. Start a Special Event request on WhatsApp and describe what you are planning so JD can review the details.",
  },
  {
    question: "What is the cancellation and rescheduling policy?",
    answer:
      "Deposits are non-refundable. Rescheduling requires at least 24 hours' notice and is subject to JD's approval and availability. Reply in the same WhatsApp conversation if you need to request a change.",
  },
  {
    question: "Where is JD's Horse Ranch located?",
    answer:
      "JD's Horse Ranch is located at 7555 Jones Rd, Fairburn, GA 30213, just outside Atlanta. The ranch operates by appointment only.",
  },
  {
    question: "How do I book a riding lesson or trail ride?",
    answer:
      "Use the Start Booking on WhatsApp button on this site. The reservation assistant collects the service, rider details, experience, and preferred date. JD then reviews the request. If approved, your booking-specific Square payment link is sent in WhatsApp and the reservation is confirmed only after payment is verified.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section bg-ranch-cream">
      <h2 className="mb-12 text-center text-4xl font-bold text-ranch-brown">
        Horseback Riding FAQ
      </h2>

      <div className="mx-auto max-w-4xl space-y-4">
        {faqItems.map((item, index) => (
          <div key={item.question} className="overflow-hidden rounded-lg bg-white shadow-md">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between px-6 py-4 transition hover:bg-gray-50"
              aria-expanded={openIndex === index}
            >
              <h3 className="text-left text-lg font-semibold text-ranch-dark">
                {item.question}
              </h3>
              <span
                aria-hidden="true"
                className={`text-xl text-ranch-brown transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
            {openIndex === index && (
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <p className="leading-relaxed text-gray-700">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

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
