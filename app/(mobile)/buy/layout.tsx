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
    <div className="max-w-[393px] mx-auto bg-white min-h-screen">
      {children}
    </div>
  );
}

