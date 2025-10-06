"use client";

import { useState } from "react";
import CreateRideForm from "./CreateRideForm";
import CompactEditRideForm from "./CompactEditRideForm";
import DeleteRideButton from "./DeleteRideButton";

type DashboardProps = {
  rides: Array<{
    id: string;
    lineName: string;
    originStopId: string;
    destinationStopId: string;
    departureTime: string;
    arrivalTime: string;
    originLabel: string;
    destinationLabel: string;
    intermediateStops?: Array<{ stopId: string; time: string; label?: string }>;
  }>;
};

type SortField = "lineName" | "departureTime" | "arrivalTime" | "origin" | "destination";
type SortDirection = "asc" | "desc";

export default function SimplifiedDashboard({ rides }: DashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRideId, setEditingRideId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [sortField, setSortField] = useState<SortField>("departureTime");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const editingRide = rides.find((r) => r.id === editingRideId);

  const filteredRides = rides.filter((ride) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Cerca nelle fermate intermedie
    const matchesIntermediateStops = ride.intermediateStops?.some((stop) => 
      stop.stopId.toLowerCase().includes(query) ||
      stop.label?.toLowerCase().includes(query)
    ) || false;
    
    return (
      ride.lineName.toLowerCase().includes(query) ||
      ride.originLabel.toLowerCase().includes(query) ||
      ride.destinationLabel.toLowerCase().includes(query) ||
      ride.departureTime.includes(query) ||
      ride.arrivalTime.includes(query) ||
      matchesIntermediateStops
    );
  });

  const sortedRides = [...(showAll ? rides : filteredRides)].sort((a, b) => {
    let compareA: string;
    let compareB: string;

    switch (sortField) {
      case "lineName":
        compareA = a.lineName;
        compareB = b.lineName;
        break;
      case "departureTime":
        compareA = a.departureTime;
        compareB = b.departureTime;
        break;
      case "arrivalTime":
        compareA = a.arrivalTime;
        compareB = b.arrivalTime;
        break;
      case "origin":
        compareA = a.originLabel;
        compareB = b.originLabel;
        break;
      case "destination":
        compareA = a.destinationLabel;
        compareB = b.destinationLabel;
        break;
      default:
        return 0;
    }

    const result = compareA.localeCompare(compareB);
    return sortDirection === "asc" ? result : -result;
  });

  const displayRides = sortedRides;
  const shouldShowResults = showAll || searchQuery;

  return (
    <div className="space-y-6">
      {/* Pulsante Crea */}
      <div>
        <button className="btn btn-primary w-full sm:w-auto" onClick={() => setShowCreateModal(true)}>
          Crea nuova corsa
        </button>
      </div>

      {/* Barra di ricerca + Mostra tutte */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowAll(false);
            }}
            placeholder="Cerca corsa, fermata, orario..."
            className="flex-1 h-10 px-4 rounded-md border bg-white/80 dark:bg-black/20"
            style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
          />
          <button
            className="btn whitespace-nowrap"
            onClick={() => {
              setShowAll(!showAll);
              setSearchQuery("");
            }}
          >
            {showAll ? "Nascondi" : "Mostra tutte"}
          </button>
        </div>

        {/* Ordinamento */}
        {shouldShowResults && (
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="text-black/60 dark:text-white/60">Ordina per:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="h-9 px-3 rounded-md border bg-white/80 dark:bg-black/20 text-sm"
              style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
            >
              <option value="departureTime">Orario partenza</option>
              <option value="arrivalTime">Orario arrivo</option>
              <option value="lineName">Nome linea</option>
              <option value="origin">Origine</option>
              <option value="destination">Destinazione</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              className="btn text-sm h-9 px-3"
              title={sortDirection === "asc" ? "Crescente" : "Decrescente"}
            >
              {sortDirection === "asc" ? "↑ A-Z" : "↓ Z-A"}
            </button>
          </div>
        )}
      </div>

      {/* Risultati ricerca / Tutte le corse */}
      {shouldShowResults && (
        <div className="card">
          <div className="p-4 border-b border-black/10 dark:border-white/10 font-medium">
            {showAll ? `Tutte le corse (${displayRides.length})` : `Risultati (${displayRides.length})`}
          </div>
          <ul className="divide-y" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}>
            {displayRides.map((r) => (
              <li key={r.id} className="p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setEditingRideId(r.id)}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm">
                      <span className="font-medium">{r.lineName}</span> • {r.originLabel} → {r.destinationLabel}
                    </div>
                    <div className="text-xs text-black/60 dark:text-white/60 mt-1">
                      {r.departureTime} → {r.arrivalTime}
                    </div>
                  </button>
                  <DeleteRideButton
                    ride={{
                      id: r.id,
                      lineName: r.lineName,
                      originLabel: r.originLabel,
                      destinationLabel: r.destinationLabel,
                      departureTime: r.departureTime,
                      arrivalTime: r.arrivalTime,
                    }}
                  />
                </div>
              </li>
            ))}
            {displayRides.length === 0 && (
              <li className="p-4 text-sm text-black/60 dark:text-white/60">Nessuna corsa trovata</li>
            )}
          </ul>
        </div>
      )}

      {/* Modale Crea Corsa */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 dark:bg-black/90 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateModal(false)}>
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-black z-10">
              <h2 className="font-medium">Crea nuova corsa</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-2xl leading-none">&times;</button>
            </div>
            <div className="p-4">
              <CreateRideForm />
            </div>
          </div>
        </div>
      )}

      {/* Modale Modifica Corsa */}
      {editingRide && (
        <div className="fixed inset-0 bg-black/80 dark:bg-black/90 flex items-center justify-center p-4 z-50" onClick={() => setEditingRideId(null)}>
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-black z-10">
              <h2 className="font-medium">Corsa: {editingRide.lineName}</h2>
              <button onClick={() => setEditingRideId(null)} className="text-2xl leading-none">&times;</button>
            </div>
            <div className="p-4">
              <CompactEditRideForm
                ride={{
                  id: editingRide.id,
                  lineName: editingRide.lineName,
                  originStopId: editingRide.originStopId,
                  destinationStopId: editingRide.destinationStopId,
                  departureTime: editingRide.departureTime,
                  arrivalTime: editingRide.arrivalTime,
                  originLabel: editingRide.originLabel,
                  destinationLabel: editingRide.destinationLabel,
                  intermediateStops: editingRide.intermediateStops || [],
                }}
                onDone={() => setEditingRideId(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

