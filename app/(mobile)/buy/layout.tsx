/**
 * Buy Page Layout
 * Simple layout wrapper for the buy page
 */
export default function BuyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[393px] mx-auto bg-[var(--background)] min-h-screen">
      {children}
    </div>
  );
}

