"use client"

export default function QueueError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-[#EFE9DA] mb-2">Queue Error</h2>
        <p className="text-[#EFE9DA]/50 mb-4">{error.message || "Could not load queue"}</p>
        <button
          onClick={reset}
          className="bg-[#E8B547] text-[#0A0F0D] px-4 py-2 rounded-lg hover:bg-[#E8B547]/90 font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
