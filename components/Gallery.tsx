"use client";

import Image from "next/image";
import { useState } from "react";

const images = [
  "https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image0.jpeg",
  "https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image1.jpeg",
  "https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image2.jpeg",
  "https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image3.jpeg",
  "https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image4.jpeg",
  "https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image5.jpeg",
  "https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image6.jpeg",
  "https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image7.jpeg",
  "https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image8.jpeg",
  "https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image9.jpeg",
];

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <section className="section bg-gray-50">
      <h2 className="text-4xl font-bold text-center mb-12 text-ranch-brown">
        Gallery
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((src, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className="relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
          >
            <Image
              src={src}
              alt={`JD's Horse Ranch - Photo ${idx + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative w-full max-w-2xl aspect-square">
            <Image
              src={images[selectedIndex]}
              alt={`Full view - Photo ${selectedIndex + 1}`}
              fill
              className="object-contain"
            />
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
