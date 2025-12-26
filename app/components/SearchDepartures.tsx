"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { normalizeStopName, normalizeCity } from "../lib/textUtils";

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

async function fetchStops(): Promise<Array<{ id: string; name: string; city: string }>> {
  const res = await fetch("/stops", { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as Array<{ id: string; name: string; city: string }>;
}

async function fetchRides(): Promise<Array<{ slug: string; lineName: string; originStopId: string; destinationStopId: string; departureTime: string; arrivalTime: string; intermediateStops?: Array<{ stopId: string; time: string }> }>> {
  const res = await fetch("/rides", { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as Array<{ slug: string; lineName: string; originStopId: string; destinationStopId: string; departureTime: string; arrivalTime: string; intermediateStops?: Array<{ stopId: string; time: string }> }>;
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
  const { trackEvent, trackSessionEvent } = useAnalytics();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedStop, setSelectedStop] = useState<string>("");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [stops, setStops] = useState<Array<{ id: string; name: string; city: string }>>([]);
  const [rides, setRides] = useState<Array<{ slug: string; lineName: string; originStopId: string; destinationStopId: string; departureTime: string; arrivalTime: string; originFascia?: number | null; destinationFascia?: number | null; intermediateStops?: Array<{ stopId: string; time: string; fascia?: number | null }> }>>([]);
  const searchTracked = useRef(false);

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

      // Get intermediate stops info
      const intermediates = (d.intermediateStops || [])
        .map((is) => stopIdToStop[is.stopId])
        .filter(Boolean);

      // Apply city filter if selected
      if (selectedCity) {
        const selectedCityLower = selectedCity.toLowerCase();
        const hasMatchingCity = 
          origin.city.toLowerCase() === selectedCityLower ||
          dest.city.toLowerCase() === selectedCityLower ||
          intermediates.some((stop) => stop.city.toLowerCase() === selectedCityLower);
        
        if (!hasMatchingCity) {
          return false;
        }
      }

      // Apply stop filter if selected
      if (selectedStop) {
        const selectedStopLower = selectedStop.toLowerCase();
        const hasMatchingStop = 
          origin.name.toLowerCase() === selectedStopLower ||
          dest.name.toLowerCase() === selectedStopLower ||
          intermediates.some((stop) => stop.name.toLowerCase() === selectedStopLower);
        
        if (!hasMatchingStop) {
          return false;
        }
      }

      // Apply free-text query from story 1.1
      if (!q) return true;
      
      // Check origin and destination
      const matchesOriginOrDest = 
        cityOrigin.includes(q) ||
        cityDest.includes(q) ||
        stopOrigin.includes(q) ||
        stopDest.includes(q);
      
      // Check intermediate stops
      const matchesIntermediate = intermediates.some(
        (stop) => 
          stop.city.toLowerCase().includes(q) ||
          stop.name.toLowerCase().includes(q)
      );
      
      return matchesOriginOrDest || matchesIntermediate;
    });
    const sorted = results.sort((a, b) => toMinutes(a.departureTime) - toMinutes(b.departureTime));
    return sortAsc ? sorted : [...sorted].reverse();
  }, [query, selectedCity, selectedStop, sortAsc, rides, stopIdToStop]);

  const handleSelectSuggestion = (value: string) => {
    setQuery(value);
    setFocused(false);
  };

  // Track searches when user performs meaningful search
  useEffect(() => {
    // Only track if there's an actual search (query or filters)
    const hasSearch = query.trim() || selectedCity || selectedStop;
    
    if (hasSearch && !searchTracked.current) {
      // Build search description
      const searchParts = [];
      if (query.trim()) searchParts.push(query.trim());
      if (selectedCity) searchParts.push(`città: ${selectedCity}`);
      if (selectedStop) searchParts.push(`fermata: ${selectedStop}`);
      
      const searchDescription = searchParts.join(', ');
      
      // Track anonymous event (always)
      trackEvent('search', {
        query: query.trim() || undefined,
        city: selectedCity || undefined,
        stop: selectedStop || undefined,
        resultsCount: filtered.length,
        hasResults: filtered.length > 0,
      });

      // Track in session (only with consent)
      trackSessionEvent('search', {
        searchDescription,
        resultsCount: filtered.length,
      });

      searchTracked.current = true;
    } else if (!hasSearch) {
      // Reset tracking flag when search is cleared
      searchTracked.current = false;
    }
  }, [query, selectedCity, selectedStop, filtered.length, trackEvent, trackSessionEvent]);

  

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
          className="w-full h-12 px-4 rounded-md border bg-white backdrop-blur text-base outline-none focus:ring-2"
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

      <div className="mt-4 flex flex-col gap-3">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="h-10 px-3 rounded-md border bg-white"
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
          className="h-10 px-3 rounded-md border bg-white"
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
          <div className="card p-5 bg-white">
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
              
              // Check if query matches an intermediate stop
              const q = query.trim().toLowerCase();
              const selectedStopLower = selectedStop.toLowerCase();
              const selectedCityLower = selectedCity.toLowerCase();
              
              let matchedIntermediateStop = null;
              let matchedIntermediateTime = null;
              
              if (d.intermediateStops && d.intermediateStops.length > 0) {
                for (const is of d.intermediateStops) {
                  const stop = stopIdToStop[is.stopId];
                  if (!stop) continue;
                  
                  const matchesQuery = q && (
                    stop.city.toLowerCase().includes(q) || 
                    stop.name.toLowerCase().includes(q)
                  );
                  const matchesSelectedStop = selectedStop && stop.name.toLowerCase() === selectedStopLower;
                  const matchesSelectedCity = selectedCity && stop.city.toLowerCase() === selectedCityLower;
                  
                  // If intermediate stop matches any filter, use it
                  if (matchesQuery || matchesSelectedStop || matchesSelectedCity) {
                    // Check it doesn't also match origin or destination
                    const isOrigin = stop.id === d.originStopId;
                    const isDest = stop.id === d.destinationStopId;
                    
                    if (!isOrigin && !isDest) {
                      matchedIntermediateStop = stop;
                      matchedIntermediateTime = is.time;
                      break;
                    }
                  }
                }
              }
              
              // Use intermediate stop info if matched, otherwise use origin
              const displayOrigin = matchedIntermediateStop || origin;
              const displayDepartureTime = matchedIntermediateTime || d.departureTime;
              
              return (
                <li key={`${d.slug}-${d.originStopId}-${d.departureTime}`}>
                  <Link
                    href={`/ride/${d.slug}`}
                    className="card p-4 flex items-center justify-between transition-colors block"
                    onClick={() => {
                      // Track ride view
                      trackEvent('view_ride', {
                        rideSlug: d.slug,
                        lineName: d.lineName,
                        origin: origin.name,
                        destination: dest.name,
                      });
                      trackSessionEvent('view_ride', {
                        rideSlug: d.slug,
                        fromSearch: true,
                      });
                    }}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium">
                        {matchedIntermediateStop ? (
                          // Show intermediate stop to destination
                          <>{normalizeStopName(displayOrigin.name)} → {normalizeStopName(dest.name)}</>
                        ) : (
                          // Show origin to destination
                          <>{normalizeStopName(origin.name)} → {normalizeStopName(dest.name)}</>
                        )}
                      </div>
                      <div className="text-xs text-black/60 dark:text-white/60 mt-1">
                        {matchedIntermediateStop ? (
                          <>Partenza da fermata intermedia {displayDepartureTime} • Arrivo {d.arrivalTime}</>
                        ) : (
                          <>Partenza {d.departureTime} • Arrivo {d.arrivalTime}</>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-mono opacity-80">
                      {displayDepartureTime} → {d.arrivalTime}
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


