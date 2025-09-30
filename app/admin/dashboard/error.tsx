"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-4xl w-full mx-auto p-6">
      <div className="rounded-md border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/20">
        <div className="text-sm font-medium mb-1">Si è verificato un errore</div>
        <div className="text-sm text-black/70 dark:text-white/70 mb-3">{error.message}</div>
        <button
          type="button"
          onClick={reset}
          className="h-10 px-3 rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20 text-sm"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}


