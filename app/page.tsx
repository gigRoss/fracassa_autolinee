import Image from "next/image";
import SearchDepartures from "./components/SearchDepartures";

export default function Home() {
  return (
    <div className="font-sans min-h-screen">
      <main className="mx-auto max-w-6xl px-4 -mt-4 relative z-10 pb-8">
        <div className="card p-6 !bg-white shadow-lg">
          <h2 className="text-[color:var(--brand-secondary)]">Cerca orari e corse</h2>
          <p className="text-sm text-[color:var(--neutral-600)] mb-3">Trova rapidamente partenze e arrivi.</p>
          <SearchDepartures />
        </div>
      </main>
    </div>
  );
}
