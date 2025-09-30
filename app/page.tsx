import Image from "next/image";
import SearchDepartures from "./components/SearchDepartures";

export default function Home() {
  return (
    <div className="font-sans min-h-screen">
      <section className="relative isolate overflow-hidden bg-hero-brand">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:pt-14 sm:pb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-[color:var(--brand-accent-orange)]">Dal 1980 al Vostro Servizio</h1>
              <p className="mt-2 text-[color:var(--neutral-600)]">Trasporto pubblico e noleggio autobus & minibus. Teramo e provincia.</p>
              {/* CTA buttons moved to header */}
            </div>
          </div>
        </div>
      </section>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="card p-4">
          <h2 className="text-[color:var(--brand-secondary)]">Cerca orari e corse</h2>
          <p className="text-sm text-[color:var(--neutral-600)] mb-3">Trova rapidamente partenze e arrivi.</p>
          <SearchDepartures />
        </div>
      </main>
    </div>
  );
}
