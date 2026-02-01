export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ranch-cream">
      <div className="text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ranch-brown"></div>
        </div>
        <p className="text-ranch-brown mt-4 font-semibold">Loading...</p>
      </div>
    </div>
  );
}
