import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ranch-cream">
      <div className="text-center px-4 max-w-md">
        <h1 className="text-6xl font-bold text-ranch-brown mb-4">404</h1>
        <h2 className="text-2xl font-bold text-ranch-dark mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-700 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="call-btn inline-block">
          Return Home
        </Link>
      </div>
    </div>
  );
}
