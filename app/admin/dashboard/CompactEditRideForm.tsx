"use client";

import { useState } from "react";
import EditRideForm from "./EditRideForm";

export type CompactEditRide = {
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
};

type EditMode = "none" | "basic" | "intermediate";

export default function CompactEditRideForm({ ride, onDone }: { ride: CompactEditRide; onDone?: () => void }) {
  const [editMode, setEditMode] = useState<EditMode>("none");

  if (editMode === "basic" || editMode === "intermediate") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode("none")}
            className="text-sm underline"
          >
            ← Torna alla vista compatta
          </button>
        </div>
        <EditRideForm
          ride={{
            id: ride.id,
            lineName: ride.lineName,
            originStopId: ride.originStopId,
            destinationStopId: ride.destinationStopId,
            departureTime: ride.departureTime,
            arrivalTime: ride.arrivalTime,
            originFascia: ride.originFascia,
            destinationFascia: ride.destinationFascia,
            intermediateStops: (ride.intermediateStops || []).map(s => ({
              stopId: s.stopId,
              time: s.time,
              fascia: typeof s.fascia === "number" ? s.fascia : "",
            })),
          }}
          onDone={onDone}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vista compatta - Informazioni base */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Dettagli corsa</h3>
          <button
            onClick={() => setEditMode("basic")}
            className="text-sm underline text-blue-600 dark:text-blue-400"
          >
            Modifica
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-black/60 dark:text-white/60">Linea</div>
            <div className="font-medium">{ride.lineName}</div>
          </div>
          <div>
            <div className="text-xs text-black/60 dark:text-white/60">Partenza</div>
            <div className="font-medium">{ride.departureTime}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-black/60 dark:text-white/60">Origine</div>
            <div className="font-medium">
              {ride.originLabel}
              {ride.originFascia && <span className="ml-2 text-xs opacity-60">(Fascia {ride.originFascia})</span>}
            </div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-black/60 dark:text-white/60">Destinazione</div>
            <div className="font-medium">
              {ride.destinationLabel}
              {ride.destinationFascia && <span className="ml-2 text-xs opacity-60">(Fascia {ride.destinationFascia})</span>}
            </div>
          </div>
          <div>
            <div className="text-xs text-black/60 dark:text-white/60">Arrivo</div>
            <div className="font-medium">{ride.arrivalTime}</div>
          </div>
        </div>
      </div>

      {/* Fermate intermedie */}
      {ride.intermediateStops && ride.intermediateStops.length > 0 && (
        <div className="space-y-3 pt-3 border-t" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Fermate intermedie ({ride.intermediateStops.length})
            </h3>
            <button
              onClick={() => setEditMode("intermediate")}
              className="text-sm underline text-blue-600 dark:text-blue-400"
            >
              Modifica
            </button>
          </div>

          <div className="space-y-2">
            {ride.intermediateStops.map((stop, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm p-2 rounded"
                style={{ background: "color-mix(in oklab, var(--foreground) 5%, transparent)" }}
              >
                <div className="flex-1">
                  {stop.label || stop.stopId}
                  {stop.fascia && <span className="ml-2 text-xs opacity-60">(Fascia {stop.fascia})</span>}
                </div>
                <div className="text-xs text-black/60 dark:text-white/60 font-mono">
                  {stop.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Azione rapida: aggiungi fermata intermedia */}
      {(!ride.intermediateStops || ride.intermediateStops.length === 0) && (
        <div className="pt-3 border-t" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}>
          <button
            onClick={() => setEditMode("intermediate")}
            className="btn w-full text-sm"
          >
            + Aggiungi fermate intermedie
          </button>
        </div>
      )}
    </div>
  );
}

