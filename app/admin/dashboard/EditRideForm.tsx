"use client";

import { useEffect, useMemo, useState } from "react";
import { Stop, toMinutes } from "@/app/lib/data";

type IntermediateStop = { stopId: string; time: string; fascia?: number | "" };

export type EditRide = {
  id: string;
  lineName: string;
  originStopId: string;
  destinationStopId: string;
  departureTime: string;
  arrivalTime: string;
  originFascia?: number | null;
  destinationFascia?: number | null;
  intermediateStops?: IntermediateStop[];
};

export default function EditRideForm({ ride, onDone }: { ride: EditRide; onDone?: () => void }) {
  const [stopsList, setStopsList] = useState<Stop[]>([]);
  const [lineName, setLineName] = useState(ride.lineName);
  const [originStopId, setOriginStopId] = useState(ride.originStopId);
  const [destinationStopId, setDestinationStopId] = useState(ride.destinationStopId);
  const [departureTime, setDepartureTime] = useState(ride.departureTime);
  const [arrivalTime, setArrivalTime] = useState(ride.arrivalTime);
  const [originFascia, setOriginFascia] = useState<number | "">(ride.originFascia ?? "");
  const [destinationFascia, setDestinationFascia] = useState<number | "">(ride.destinationFascia ?? "");
  const [intermediateStops, setIntermediateStops] = useState<IntermediateStop[]>(ride.intermediateStops || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addingOrigin, setAddingOrigin] = useState(false);
  const [addingDestination, setAddingDestination] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [newName, setNewName] = useState("");
  const [addingStopSubmitting, setAddingStopSubmitting] = useState(false);
  const [addingStopError, setAddingStopError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/admin/stops", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Stop[];
        if (!cancelled) setStopsList(data);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedStops = useMemo(() => {
    return [...stopsList].sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  }, [stopsList]);

  async function addNewStop(setFor: "origin" | "destination") {
    setAddingStopError(null);
    if (!newCity.trim() || !newName.trim()) {
      setAddingStopError("Inserisci città e nome");
      return;
    }
    setAddingStopSubmitting(true);
    try {
      const res = await fetch("/admin/stops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: newCity.trim(), name: newName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Errore creazione fermata" }));
        throw new Error(data.error || "Errore creazione fermata");
      }
      const created = (await res.json()) as Stop;
      setStopsList((prev) => [...prev, created]);
      if (setFor === "origin") setOriginStopId(created.id);
      if (setFor === "destination") setDestinationStopId(created.id);
      setNewCity("");
      setNewName("");
      setAddingOrigin(false);
      setAddingDestination(false);
    } catch (e: any) {
      setAddingStopError(e.message || "Errore creazione fermata");
    } finally {
      setAddingStopSubmitting(false);
    }
  }

  function addIntermediate() {
    setIntermediateStops((prev) => [...prev, { stopId: "", time: "", fascia: "" }]);
  }
  function updateIntermediate(idx: number, partial: Partial<IntermediateStop>) {
    setIntermediateStops((prev) => prev.map((s, i) => (i === idx ? { ...s, ...partial } : s)));
  }
  function removeIntermediate(idx: number) {
    setIntermediateStops((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const hhmm = /^\d{2}:\d{2}$/;
    if (!lineName || !originStopId || !destinationStopId || !departureTime || !arrivalTime) {
      setError("Compila tutti i campi obbligatori");
      return;
    }
    if (!hhmm.test(departureTime) || !hhmm.test(arrivalTime)) {
      setError("Formato orario non valido (HH:MM)");
      return;
    }
    if (toMinutes(arrivalTime) <= toMinutes(departureTime)) {
      setError("L'orario di arrivo deve essere successivo alla partenza");
      return;
    }

    setSubmitting(true);
    try {
      // Process origin and destination fascia
      let processedOriginFascia: number | undefined = undefined;
      if (originFascia !== "" && originFascia !== undefined && originFascia !== null) {
        const fasciaNum = typeof originFascia === 'number' ? originFascia : Number(originFascia);
        if (!isNaN(fasciaNum) && fasciaNum > 0 && Number.isInteger(fasciaNum)) {
          processedOriginFascia = fasciaNum;
        }
      }
      
      let processedDestinationFascia: number | undefined = undefined;
      if (destinationFascia !== "" && destinationFascia !== undefined && destinationFascia !== null) {
        const fasciaNum = typeof destinationFascia === 'number' ? destinationFascia : Number(destinationFascia);
        if (!isNaN(fasciaNum) && fasciaNum > 0 && Number.isInteger(fasciaNum)) {
          processedDestinationFascia = fasciaNum;
        }
      }

      const res = await fetch(`/admin/rides/${ride.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineName,
          originStopId,
          destinationStopId,
          departureTime,
          arrivalTime,
          originFascia: processedOriginFascia,
          destinationFascia: processedDestinationFascia,
          intermediateStops: intermediateStops
            .filter((s) => s.stopId && s.time)
            .map((s) => {
              let fascia: number | undefined = undefined;
              // Only set fascia if it's a valid positive integer
              if (s.fascia !== "" && s.fascia !== undefined && s.fascia !== null) {
                const fasciaNum = typeof s.fascia === 'number' ? s.fascia : Number(s.fascia);
                // Don't allow 0 or NaN - only positive integers
                if (!isNaN(fasciaNum) && fasciaNum > 0 && Number.isInteger(fasciaNum)) {
                  fascia = fasciaNum;
                }
              }
              return { stopId: s.stopId, time: s.time, fascia };
            }),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Errore" }));
        throw new Error(data.error || "Errore aggiornamento corsa");
      }
      setSuccess("Corsa aggiornata con successo");
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      onDone?.();
    } catch (err: any) {
      setError(err.message || "Errore aggiornamento corsa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && (
        <div className="text-sm rounded p-2" style={{ color: "var(--error)", background: "color-mix(in oklab, var(--error) 10%, transparent)", border: "1px solid color-mix(in oklab, var(--error) 30%, transparent)" }}>{error}</div>
      )}
      {success && (
        <div className="text-sm rounded p-2" style={{ color: "var(--success)", background: "color-mix(in oklab, var(--success) 10%, transparent)", border: "1px solid color-mix(in oklab, var(--success) 30%, transparent)" }}>{success}</div>
      )}
      <div className="space-y-3">
        <div>
          <label className="block text-xs mb-1">Linea*</label>
          <input value={lineName} onChange={(e) => setLineName(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }} placeholder="L1" />
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Fermate della corsa</div>
          <button type="button" className="text-xs underline" onClick={() => { setAddingOrigin((v) => !v); setAddingDestination(false); }}>
            {addingOrigin ? "Chiudi" : "+ Nuova fermata"}
          </button>
        </div>
        {addingOrigin && (
          <div className="mb-3 p-3 space-y-2 rounded-md border" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)", background: "color-mix(in oklab, var(--foreground) 3%, transparent)" }}>
            {addingStopError && <div className="text-xs text-red-600">{addingStopError}</div>}
            <input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Città" className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }} />
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome fermata" className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }} />
            <button type="button" disabled={addingStopSubmitting} onClick={() => addNewStop("origin")} className="btn w-full text-sm disabled:opacity-60">
              {addingStopSubmitting ? "Creazione..." : "Crea fermata"}
            </button>
          </div>
        )}
        <div className="space-y-3">
          {/* ORIGIN STOP (First) */}
          <div className="space-y-2 p-3 rounded-md border" style={{ borderColor: "color-mix(in oklab, var(--foreground) 20%, transparent)", background: "color-mix(in oklab, var(--success) 5%, transparent)" }}>
            <div className="text-xs font-medium text-black/60 dark:text-white/60 mb-1">🚏 Fermata di Partenza (Origine)</div>
            <select
              value={originStopId}
              onChange={(e) => setOriginStopId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
              style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
            >
              <option value="">Seleziona fermata</option>
              {sortedStops.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.city} - {st.name}
                </option>
              ))}
            </select>
            <input
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              placeholder="Orario partenza (HH:MM)"
              className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
              style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
            />
            <input
              value={originFascia ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setOriginFascia(v === "" ? "" : Number(v));
              }}
              placeholder="Fascia (es. 1, 2, 3, 4)"
              className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
              style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
              inputMode="numeric"
            />
          </div>

          {/* INTERMEDIATE STOPS */}
          {intermediateStops.map((s, i) => (
            <div key={i} className="space-y-2 p-3 rounded-md border" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)", background: "color-mix(in oklab, var(--foreground) 3%, transparent)" }}>
              <div className="text-xs font-medium text-black/60 dark:text-white/60 mb-1">Fermata intermedia #{i + 1}</div>
              <select
                value={s.stopId}
                onChange={(e) => updateIntermediate(i, { stopId: e.target.value })}
                className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
                style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
              >
                <option value="">Seleziona fermata</option>
                {sortedStops.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.city} - {st.name}
                  </option>
                ))}
              </select>
              <input
                value={s.time}
                onChange={(e) => updateIntermediate(i, { time: e.target.value })}
                placeholder="Orario (HH:MM)"
                className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
                style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
              />
              <input
                value={s.fascia ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  updateIntermediate(i, { fascia: v === "" ? "" : Number(v) });
                }}
                placeholder="Fascia (es. 1, 2, 3, 4)"
                className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
                style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
                inputMode="numeric"
              />
              <button type="button" className="btn w-full text-sm" onClick={() => removeIntermediate(i)}>
                Rimuovi fermata
              </button>
            </div>
          ))}

          {/* DESTINATION STOP (Last) */}
          <div className="space-y-2 p-3 rounded-md border" style={{ borderColor: "color-mix(in oklab, var(--foreground) 20%, transparent)", background: "color-mix(in oklab, var(--error) 5%, transparent)" }}>
            <div className="text-xs font-medium text-black/60 dark:text-white/60 mb-1">🏁 Fermata di Arrivo (Destinazione)</div>
            <select
              value={destinationStopId}
              onChange={(e) => setDestinationStopId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
              style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
            >
              <option value="">Seleziona fermata</option>
              {sortedStops.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.city} - {st.name}
                </option>
              ))}
            </select>
            <input
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              placeholder="Orario arrivo (HH:MM)"
              className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
              style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
            />
            <input
              value={destinationFascia ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setDestinationFascia(v === "" ? "" : Number(v));
              }}
              placeholder="Fascia (es. 1, 2, 3, 4)"
              className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
              style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
              inputMode="numeric"
            />
          </div>
        </div>
        <div className="mt-3">
          <button type="button" className="btn w-full text-sm" onClick={addIntermediate}>
            + Aggiungi fermata intermedia
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={submitting} className="btn btn-primary text-sm disabled:opacity-60">
          {submitting ? "Salvataggio..." : "Salva modifiche"}
        </button>
      </div>
    </form>
  );
}


