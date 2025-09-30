export default function Loading() {
  return (
    <div className="max-w-4xl w-full mx-auto p-6 space-y-4">
      <div className="h-6 w-60 bg-black/10 dark:bg-white/10 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-md border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5" />
        ))}
      </div>
      <div className="h-64 rounded-md border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5" />
    </div>
  );
}


