"use client";

function whatsappUrl(message: string) {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "14049812361";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

interface ServiceCardProps {
  title: string;
  description: string;
  pricing: string[];
  whatsappMessage: string;
  ctaLabel: string;
}

function ServiceCard({
  title,
  description,
  pricing,
  whatsappMessage,
  ctaLabel,
}: ServiceCardProps) {
  return (
    <div className="service-card flex h-full flex-col">
      <h3 className="mb-3 text-2xl font-bold text-ranch-brown">{title}</h3>
      <p className="mb-4 text-gray-700">{description}</p>

      <div className="mb-4">
        <p className="mb-2 font-semibold text-ranch-dark">Pricing:</p>
        <ul className="space-y-1">
          {pricing.map((price) => (
            <li key={price} className="text-gray-700">
              • {price}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600">
          <em>
            Deposits are non-refundable. Rescheduling requires at least 24
            hours&apos; notice and remains subject to JD&apos;s approval.
          </em>
        </p>
      </div>

      <a
        href={whatsappUrl(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto block w-full rounded-xl bg-green-600 px-5 py-4 text-center font-bold text-white transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200"
      >
        {ctaLabel}
      </a>
    </div>
  );
}

export default function Services() {
  return (
    <section className="section bg-white">
      <h2 className="mb-4 text-center text-4xl font-bold text-ranch-brown">
        Our Services
      </h2>
      <p className="mx-auto mb-12 max-w-2xl text-center text-gray-600">
        Choose the experience you want, then start the reservation in WhatsApp.
        JD reviews every request before anything is confirmed.
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <ServiceCard
          title="Riding Lessons"
          description="Come experience an amazing time of your life, memories you will have forever. Whether you want to start a new hobby, or just always wanted to go horseback riding, JD's Horse Ranch can help create that space for you."
          pricing={[
            "1 hour – Starting at $85",
            "Children 9 years old and under – 30 minutes for $45",
          ]}
          whatsappMessage="Hi, I'd like to request a riding lesson at JD's Horse Ranch."
          ctaLabel="Request a Lesson on WhatsApp"
        />

        <ServiceCard
          title="Trail Rides"
          description="Beautiful natural trails with amazing sights. Request a guided ride for yourself, a friend, or someone special and create an unforgettable memory."
          pricing={[
            "Guided 1 hour trail ride for 1 – $85",
            "Guided 1 hour trail ride for 2 – $160",
            "Guided 1 hour trail ride for 3 – $245",
          ]}
          whatsappMessage="Hi, I'd like to request a trail ride at JD's Horse Ranch."
          ctaLabel="Request a Trail Ride on WhatsApp"
        />

        <ServiceCard
          title="Special Events"
          description="Make birthdays, video shoots, photo shoots, and other special occasions more memorable with a horse experience tailored by JD."
          pricing={["1 hour horse rental – $200"]}
          whatsappMessage="Hi, I'd like to ask about a special event at JD's Horse Ranch."
          ctaLabel="Ask About an Event on WhatsApp"
        />
      </div>
    </section>
  );
}
