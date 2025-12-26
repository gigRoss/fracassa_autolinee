"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    originFascia?: number | null;
    destinationFascia?: number | null;
    intermediateStops?: Array<{ stopId: string; time: string; label?: string; fascia?: number | null }>;
  }>;
  showArchived?: boolean;
};

type SortField = "lineName" | "departureTime" | "arrivalTime" | "origin" | "destination";
type SortDirection = "asc" | "desc";

function RestoreRideButton({ rideId }: { rideId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  async function handleRestore() {
    setSubmitting(true);
    try {
      const res = await fetch(`/admin/rides/${rideId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      });
      if (!res.ok) {
        throw new Error("Errore ripristino");
      }
      // Remove from archived_rides cookie
      try {
        const current = (document.cookie.match(/(?:^|; )archived_rides=([^;]*)/)?.[1] || "").split(",").filter(Boolean);
        const filtered = current.filter((id) => id !== rideId);
        document.cookie = `archived_rides=${filtered.join(",")}; path=/; max-age=${60 * 60 * 24 * 7}`;
      } catch {}
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }
  
  return (
    <button
      type="button"
      onClick={handleRestore}
      className="btn"
      disabled={submitting}
    >
      {submitting ? "Ripristino..." : "Ripristina"}
    </button>
  );
}

export default function SimplifiedDashboard({ rides, showArchived = false }: DashboardProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRideId, setEditingRideId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("departureTime");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const editingRide = rides.find((r) => r.id === editingRideId);
  
  const handleToggleArchived = () => {
    if (showArchived) {
      router.push("/admin/dashboard");
    } else {
      router.push("/admin/dashboard?archived=true");
    }
  };

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

  const sortedRides = [...filteredRides].sort((a, b) => {
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

  return (
    <div className="space-y-6">
      {/* Pulsante Archiviati */}
      <div className="frame-155">
        <div className="frame-64">
          <button className="frame-49 w-full" onClick={handleToggleArchived}>
            <div className="crea-nuova-corsa">{showArchived ? "← Torna alle corse" : "Archiviati"}</div>
          </button>
        </div>
      </div>

      {/* Pulsanti Crea e Cerca */}
      <div className="frame-155">
        <div className="frame-64">
          <button className="frame-49 w-full" onClick={() => setShowCreateModal(true)} disabled={showArchived}>
            <div className="crea-nuova-corsa" style={showArchived ? { opacity: 0.5 } : {}}>Crea nuova corsa</div>
          </button>
        </div>
        <div className="frame-64">
          <div className="frame-49 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca corsa, fermata, orario..."
              className="search-input"
              style={{
                width: '100%',
                height: 'auto',
                minHeight: 0,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontFamily: '"Inter-Medium", sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1',
                color: 'rgba(0, 0, 0, 0.8)',
                padding: 0,
                margin: 0,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* Ordinamento */}
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

      {/* Lista corse */}
      <div className="card">
        <div className="p-4 border-b border-black/10 dark:border-white/10 font-medium">
          {showArchived 
            ? `Corse archiviate (${displayRides.length})`
            : searchQuery
              ? `Risultati ricerca (${displayRides.length})`
              : `Tutte le corse (${displayRides.length})`}
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
                  {showArchived ? (
                    <RestoreRideButton rideId={r.id} />
                  ) : (
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
                  )}
                </div>
              </li>
            ))}
            {displayRides.length === 0 && (
              <li className="p-4 text-sm text-black/60 dark:text-white/60">Nessuna corsa trovata</li>
            )}
          </ul>
        </div>

      {/* Modale Crea Corsa */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 dark:bg-black/90 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateModal(false)}>
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-black z-10">
              <h2 className="font-medium">Crea nuova corsa</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-2xl leading-none">&times;</button>
            </div>
            <div className="p-4">
              <CreateRideForm onSuccess={() => setShowCreateModal(false)} />
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
                  originFascia: editingRide.originFascia,
                  destinationFascia: editingRide.destinationFascia,
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

