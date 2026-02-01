"use client";

export default function Experience() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-ranch-dark text-center mb-12">
          The Experience
        </h2>

        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg mb-8">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="JD's Horse Ranch - The Experience"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0"
          />
        </div>

        <p className="text-gray-700 text-center text-lg max-w-3xl mx-auto">
          Discover what makes JD's Horse Ranch special. From riding lessons to scenic trail rides,
          experience the peace and joy of horseback riding in the Georgia countryside.
        </p>
      </div>
    </section>
  );
}
