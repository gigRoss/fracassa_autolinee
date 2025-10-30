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
  price?: string;
  intermediateStops?: IntermediateStop[];
};

export default function EditRideForm({ ride, onDone }: { ride: EditRide; onDone?: () => void }) {
  const [stopsList, setStopsList] = useState<Stop[]>([]);
  const [lineName, setLineName] = useState(ride.lineName);
  const [originStopId, setOriginStopId] = useState(ride.originStopId);
  const [destinationStopId, setDestinationStopId] = useState(ride.destinationStopId);
  const [departureTime, setDepartureTime] = useState(ride.departureTime);
  const [arrivalTime, setArrivalTime] = useState(ride.arrivalTime);
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
      const res = await fetch(`/admin/rides/${ride.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineName,
          originStopId,
          destinationStopId,
          departureTime,
          arrivalTime,
          intermediateStops: intermediateStops
            .filter((s) => s.stopId && s.time)
            .map((s) => ({ stopId: s.stopId, time: s.time, fascia: s.fascia === "" ? undefined : Number(s.fascia) })),
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
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs">Origine*</label>
            <button type="button" className="text-xs underline" onClick={() => { setAddingOrigin((v) => !v); setAddingDestination(false); }}>
              {addingOrigin ? "Chiudi" : "Nuova fermata"}
            </button>
          </div>
          <select value={originStopId} onChange={(e) => setOriginStopId(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}>
            <option value="">Seleziona fermata</option>
            {sortedStops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.city} - {s.name}
              </option>
            ))}
          </select>
          {addingOrigin && (
            <div className="mt-2 space-y-2">
              {addingStopError && <div className="text-xs text-red-600">{addingStopError}</div>}
              <input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Città" className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }} />
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome fermata" className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }} />
              <button type="button" disabled={addingStopSubmitting} onClick={() => addNewStop("origin")} className="btn w-full text-sm disabled:opacity-60">
                {addingStopSubmitting ? "Creazione..." : "Crea e seleziona"}
              </button>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs">Destinazione*</label>
            <button type="button" className="text-xs underline" onClick={() => { setAddingDestination((v) => !v); setAddingOrigin(false); }}>
              {addingDestination ? "Chiudi" : "Nuova fermata"}
            </button>
          </div>
          <select value={destinationStopId} onChange={(e) => setDestinationStopId(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}>
            <option value="">Seleziona fermata</option>
            {sortedStops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.city} - {s.name}
              </option>
            ))}
          </select>
          {addingDestination && (
            <div className="mt-2 space-y-2">
              {addingStopError && <div className="text-xs text-red-600">{addingStopError}</div>}
              <input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Città" className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }} />
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome fermata" className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }} />
              <button type="button" disabled={addingStopSubmitting} onClick={() => addNewStop("destination")} className="btn w-full text-sm disabled:opacity-60">
                {addingStopSubmitting ? "Creazione..." : "Crea e seleziona"}
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs mb-1">Partenza (HH:MM)*</label>
          <input value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }} placeholder="08:15" />
        </div>
        <div>
          <label className="block text-xs mb-1">Arrivo (HH:MM)*</label>
          <input value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }} placeholder="08:55" />
        </div>
        
      </div>

      <div className="pt-2">
        <div className="text-sm font-medium mb-2">Fermate intermedie</div>
        <div className="space-y-3">
          {intermediateStops.map((s, i) => (
            <div key={i} className="space-y-2 p-3 rounded-md border" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)", background: "color-mix(in oklab, var(--foreground) 3%, transparent)" }}>
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
                placeholder="Fascia (es. 1, 2, 3 ,4)"
                className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
                style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
                inputMode="numeric"
              />
              <button type="button" className="btn w-full text-sm" onClick={() => removeIntermediate(i)}>
                Rimuovi fermata
              </button>
            </div>
          ))}
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


