/**
 * Mobile App Root Layout
 * Wraps all mobile app routes: splash, home, search, etc.
 */
export default function MobileLayout({
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



