"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ranch-cream">
      <div className="text-center px-4 max-w-md">
        <h2 className="text-3xl font-bold text-ranch-brown mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-700 mb-8">
          We encountered an error. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="call-btn inline-block"
        >
          Try again
        </button>
        <p className="text-xs text-gray-500 mt-4">
          Error ID: {error.digest || "unknown"}
        </p>
      </div>
    </div>
  );
}
