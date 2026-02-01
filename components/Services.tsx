"use client";

interface ServiceCardProps {
  title: string;
  description: string;
  pricing: string[];
  details: string[];
  onCall: () => void;
  isLoading: boolean;
}

function ServiceCard({
  title,
  description,
  pricing,
  details,
  onCall,
  isLoading,
}: ServiceCardProps) {
  return (
    <div className="service-card">
      <h3 className="text-2xl font-bold mb-3 text-ranch-brown">{title}</h3>
      <p className="text-gray-700 mb-4">{description}</p>

      <div className="mb-4">
        <p className="font-semibold text-ranch-dark mb-2">Pricing:</p>
        <ul className="space-y-1">
          {pricing.map((price, i) => (
            <li key={i} className="text-gray-700">
              • {price}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600">
          <em>
            Deposits are non-refundable. Can reschedule 24 hours prior to
            schedule time.
          </em>
        </p>
      </div>

      <button onClick={onCall} disabled={isLoading} className="call-btn w-full">
        {isLoading ? "Connecting..." : "Call Now"}
      </button>
    </div>
  );
}

interface ServicesProps {
  onCall: () => void;
  isLoading: boolean;
}

export default function Services({ onCall, isLoading }: ServicesProps) {
  return (
    <section className="section bg-white">
      <h2 className="text-4xl font-bold text-center mb-12 text-ranch-brown">
        Our Services
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ServiceCard
          title="Riding Lessons"
          description="Come experience an amazing time of your life, memories you will have forever. Whether you want to start a new hobby, or just always wanted to go horseback riding, JD's Horse Ranch can help create that space for you."
          pricing={[
            "1 hour – Starting at $85",
            "Children 9 years old and under – 30 minutes for $45",
          ]}
          details={[]}
          onCall={onCall}
          isLoading={isLoading}
        />

        <ServiceCard
          title="Trail Rides"
          description="Beautiful natural trails with amazing sights, book now for you and a friend or that special someone you want to create an amazing memory with."
          pricing={[
            "Guided 1 hour trail ride for 1 – $85",
            "Guided 1 hour trail ride for 2 – $160",
            "Guided 1 hour trail ride for 3 – $245",
          ]}
          details={[]}
          onCall={onCall}
          isLoading={isLoading}
        />

        <ServiceCard
          title="Special Events"
          description="Do you want to give that extra special and memorable birthday party? Video shoots, photo shoots, and more."
          pricing={["1 hour horse rental – $200"]}
          details={[]}
          onCall={onCall}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}
