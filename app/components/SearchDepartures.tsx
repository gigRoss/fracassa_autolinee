"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toMinutes } from "../lib/data";

async function fetchStops(): Promise<Array<{ id: string; name: string; city: string }>> {
  const res = await fetch("/stops", { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as Array<{ id: string; name: string; city: string }>;
}

async function fetchRides(): Promise<Array<{ id: string; lineName: string; originStopId: string; destinationStopId: string; departureTime: string; arrivalTime: string }>> {
  const res = await fetch("/rides", { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as Array<{ id: string; lineName: string; originStopId: string; destinationStopId: string; departureTime: string; arrivalTime: string }>;
}

function useSuggestions(query: string, stops: Array<{ id: string; name: string; city: string }>): string[] {
  const normalized = query.trim().toLowerCase();
  return useMemo(() => {
    if (!normalized) return [];
    const names = new Set<string>();
    for (const stop of stops) {
      const cityMatch = stop.city.toLowerCase().includes(normalized);
      const stopMatch = stop.name.toLowerCase().includes(normalized);
      if (cityMatch) names.add(stop.city);
      if (stopMatch) names.add(stop.name);
    }
    return Array.from(names).slice(0, 8);
  }, [normalized, stops]);
}

export default function SearchDepartures() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedStop, setSelectedStop] = useState<string>("");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [stops, setStops] = useState<Array<{ id: string; name: string; city: string }>>([]);
  const [rides, setRides] = useState<Array<{ id: string; lineName: string; originStopId: string; destinationStopId: string; departureTime: string; arrivalTime: string }>>([]);

  // Load stops and rides from public API
  useMemo(() => {
    (async () => {
      try {
        const [s, r] = await Promise.all([fetchStops(), fetchRides()]);
        setStops(s);
        setRides(r);
      } catch {}
    })();
  }, []);

  const suggestions = useSuggestions(query, stops);

  const stopIdToStop = useMemo(() => Object.fromEntries(stops.map((s) => [s.id, s] as const)), [stops]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const results = rides.filter((d) => {
      const origin = stopIdToStop[d.originStopId];
      const dest = stopIdToStop[d.destinationStopId];
      const cityOrigin = origin.city.toLowerCase();
      const cityDest = dest.city.toLowerCase();
      const stopOrigin = origin.name.toLowerCase();
      const stopDest = dest.name.toLowerCase();

      // Apply city filter if selected
      if (selectedCity) {
        if (
          origin.city.toLowerCase() !== selectedCity.toLowerCase() &&
          dest.city.toLowerCase() !== selectedCity.toLowerCase()
        ) {
          return false;
        }
      }

      // Apply stop filter if selected
      if (selectedStop) {
        if (
          origin.name.toLowerCase() !== selectedStop.toLowerCase() &&
          dest.name.toLowerCase() !== selectedStop.toLowerCase()
        ) {
          return false;
        }
      }

      // Apply free-text query from story 1.1
      if (!q) return true;
      return (
        cityOrigin.includes(q) ||
        cityDest.includes(q) ||
        stopOrigin.includes(q) ||
        stopDest.includes(q)
      );
    });
    const sorted = results.sort((a, b) => toMinutes(a.departureTime) - toMinutes(b.departureTime));
    return sortAsc ? sorted : [...sorted].reverse();
  }, [query, selectedCity, selectedStop, sortAsc, rides, stopIdToStop]);

  const handleSelectSuggestion = (value: string) => {
    setQuery(value);
    setFocused(false);
    
  };

  

  return (
     
    <section className="w-full max-w-xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Cerca per città o fermata..."
          className="w-full h-12 px-4 rounded-md border bg-white/80 dark:bg-black/20 backdrop-blur text-base outline-none focus:ring-2"
          style={{
            borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)",
            boxShadow: "0 0 0 2px color-mix(in oklab, var(--brand-primary) 25%, transparent)",
          }}
          aria-label="Campo di ricerca città o fermata"
        />
        {focused && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg overflow-hidden"
            style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
          >
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2"
                  style={{ background: "transparent" }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectSuggestion(s)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
          style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
          aria-label="Filtro città"
        >
          <option value="">Tutte le città</option>
          {Array.from(new Set(stops.map((s) => s.city))).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          value={selectedStop}
          onChange={(e) => setSelectedStop(e.target.value)}
          className="h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
          style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
          aria-label="Filtro fermata"
        >
          <option value="">Tutte le fermate</option>
          {Array.from(new Set(stops.map((s) => s.name))).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setSortAsc((v) => !v)}
          className="btn"
          aria-label="Ordina per orario"
        >
          Ordina: {sortAsc ? "Ascendente" : "Discendente"}
        </button>
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <div className="card p-5" style={{ background: "color-mix(in oklab, var(--neutral-0) 60%, transparent)" }}>
            <div className="text-sm font-medium mb-1">Nessuna corsa trovata</div>
            <div className="text-sm text-black/70 dark:text-white/70 mb-3">
              Prova a:
              <ul className="list-disc list-inside mt-1">
                <li>Controllare l'ortografia di città o fermata</li>
                <li>Rimuovere o cambiare i filtri</li>
                <li>Usare solo la città oppure solo la fermata</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setSelectedCity("");
                  setSelectedStop("");
                  setQuery("");
                  setSortAsc(true);
                }}
              >
                Pulisci ricerca
              </button>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((d) => {
              const origin = stopIdToStop[d.originStopId];
              const dest = stopIdToStop[d.destinationStopId];
              return (
                <li key={d.id}>
                  <Link
                    href={`/ride/${d.id}`}
                    className="card p-4 flex items-center justify-between transition-colors block"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium">
                        {d.lineName} • {origin.city} ({origin.name}) → {dest.city} ({dest.name})
                      </div>
                      <div className="text-xs text-black/60 dark:text-white/60 mt-1">
                        Partenza {d.departureTime} • Arrivo {d.arrivalTime}
                      </div>
                    </div>
                    <div className="text-sm font-mono opacity-80">
                      {d.departureTime} → {d.arrivalTime}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}


