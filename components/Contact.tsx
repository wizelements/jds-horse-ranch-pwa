"use client";

interface ContactProps {
  onCall: () => void;
  isLoading: boolean;
}

export default function Contact({ onCall, isLoading }: ContactProps) {
  return (
    <section className="section bg-ranch-dark text-white">
      <h2 className="text-4xl font-bold text-center mb-12">Get In Touch</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Address</h3>
          <p className="text-gray-300">
            7555 Jones Rd<br />
            Fairburn, GA 30213
          </p>
          <a
            href="https://goo.gl/maps/x1ek6hiBF7yAnojt8"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:underline mt-2 inline-block"
          >
            Open in Maps
          </a>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Call For Appointment</h3>
          <button
            onClick={onCall}
            disabled={isLoading}
            className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition"
          >
            (404) 981-2361
          </button>
          <p className="text-gray-300 text-sm mt-2">BY APPOINTMENT ONLY</p>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Email Us</h3>
          <a
            href="mailto:jdshorseranch@gmail.com"
            className="text-yellow-400 hover:text-yellow-300 transition break-all"
          >
            jdshorseranch@gmail.com
          </a>
          <div className="flex justify-center gap-4 mt-6">
            <a
              href="https://www.facebook.com/Jdshorseranch/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/jdshorseranch/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition"
            >
              Instagram
            </a>
            <a
              href="https://www.youtube.com/channel/UCDSI825ADeouC31jTQmlgyQ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-400 text-sm mt-12">
        © 2026 JD's Horse Ranch. All rights reserved.
      </p>
    </section>
  );
}
