"use client";

import { useEffect, useMemo, useState } from "react";
import type { Stop } from "@/app/lib/data";

type StopMode = "existing" | "new";
type IntermediateStop = {
  stopId: string;
  time: string;
  fascia?: number | "";
  isNew?: boolean;
  newCity?: string;
  newName?: string;
};

export default function CreateRideForm() {
  const [lineName, setLineName] = useState("");
  const [stopsList, setStopsList] = useState<Stop[]>([]);
  const [originMode, setOriginMode] = useState<StopMode>("existing");
  const [originStopId, setOriginStopId] = useState("");
  const [originNewCity, setOriginNewCity] = useState("");
  const [originNewName, setOriginNewName] = useState("");
  const [destinationMode, setDestinationMode] = useState<StopMode>("existing");
  const [destinationStopId, setDestinationStopId] = useState("");
  const [destinationNewCity, setDestinationNewCity] = useState("");
  const [destinationNewName, setDestinationNewName] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [intermediateStops, setIntermediateStops] = useState<IntermediateStop[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    // Basic validations
    const hhmm = /^\d{2}:\d{2}$/;
    const originValid =
      (originMode === "existing" && !!originStopId) ||
      (originMode === "new" && !!originNewCity && !!originNewName);
    const destinationValid =
      (destinationMode === "existing" && !!destinationStopId) ||
      (destinationMode === "new" && !!destinationNewCity && !!destinationNewName);

    if (!lineName || !originValid || !destinationValid || !departureTime || !arrivalTime) {
      setError("Compila tutti i campi obbligatori");
      return;
    }
    if (!hhmm.test(departureTime) || !hhmm.test(arrivalTime)) {
      setError("Formato orario non valido (HH:MM)");
      return;
    }

    setSubmitting(true);
    try {
      async function ensureStop(existingId: string, mode: StopMode, newCity: string, newName: string): Promise<string> {
        if (mode === "existing") return existingId;
        const res = await fetch("/admin/stops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city: newCity, name: newName }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Errore" }));
          throw new Error(data.error || "Errore creazione fermata");
        }
        const created = (await res.json()) as { id: string };
        return created.id;
      }

      const originId = await ensureStop(originStopId, originMode, originNewCity, originNewName);
      const destId = await ensureStop(
        destinationStopId,
        destinationMode,
        destinationNewCity,
        destinationNewName
      );

      const processedIntermediates = (
        await Promise.all(
          intermediateStops.map(async (s) => {
            if (!s.time) return null;
            if (s.isNew) {
              if (!s.newCity || !s.newName) return null;
              const id = await ensureStop("", "new", s.newCity, s.newName);
              return { stopId: id, time: s.time, fascia: s.fascia === "" ? undefined : Number(s.fascia) };
            }
            if (!s.stopId) return null;
            return { stopId: s.stopId, time: s.time, fascia: s.fascia === "" ? undefined : Number(s.fascia) };
          })
        )
      ).filter(Boolean) as Array<{ stopId: string; time: string; fascia?: number }>;

      const res = await fetch("/admin/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineName,
          originStopId: originId,
          destinationStopId: destId,
          departureTime,
          arrivalTime,
          intermediateStops: processedIntermediates,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Errore" }));
        throw new Error(data.error || "Errore creazione corsa");
      }
      setSuccess("Corsa creata con successo");
      setLineName("");
      setOriginMode("existing");
      setOriginStopId("");
      setOriginNewCity("");
      setOriginNewName("");
      setDestinationMode("existing");
      setDestinationStopId("");
      setDestinationNewCity("");
      setDestinationNewName("");
      setDepartureTime("");
      setArrivalTime("");
      setIntermediateStops([]);
      // Trigger a refresh of server components list via router refresh
      if (typeof window !== "undefined") {
        // Soft refresh: navigate to same page to refresh server components
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Errore creazione corsa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && (
        <div className="text-sm rounded p-2" style={{ color: "var(--error)", background: "color-mix(in oklab, var(--error) 10%, transparent)", border: "1px solid color-mix(in oklab, var(--error) 30%, transparent)" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm rounded p-2" style={{ color: "var(--success)", background: "color-mix(in oklab, var(--success) 10%, transparent)", border: "1px solid color-mix(in oklab, var(--success) 30%, transparent)" }}>
          {success}
        </div>
      )}
      <div className="space-y-3">
        <div>
          <label className="block text-xs mb-1">Linea*</label>
          <input value={lineName} onChange={(e) => setLineName(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }} placeholder="L1" />
        </div>
        <div>
          <label className="block text-xs mb-1">Origine*</label>
          <select
            value={originMode === "existing" ? originStopId : "__new__"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "__new__") {
                setOriginMode("new");
                setOriginStopId("");
              } else {
                setOriginMode("existing");
                setOriginStopId(val);
              }
            }}
            className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
            style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
         >
            <option value="">Seleziona fermata</option>
            {sortedStops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.city} - {s.name}
              </option>
            ))}
            <option value="__new__">+ Aggiungi nuova fermata…</option>
          </select>
          {originMode === "new" && (
            <div className="mt-2 space-y-2">
              <input
                value={originNewCity}
                onChange={(e) => setOriginNewCity(e.target.value)}
                placeholder="Città"
                className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
              />
              <input
                value={originNewName}
                onChange={(e) => setOriginNewName(e.target.value)}
                placeholder="Nome fermata"
                className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
              />
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs mb-1">Destinazione*</label>
          <select
            value={destinationMode === "existing" ? destinationStopId : "__new__"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "__new__") {
                setDestinationMode("new");
                setDestinationStopId("");
              } else {
                setDestinationMode("existing");
                setDestinationStopId(val);
              }
            }}
            className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
            style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
         >
            <option value="">Seleziona fermata</option>
            {sortedStops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.city} - {s.name}
              </option>
            ))}
            <option value="__new__">+ Aggiungi nuova fermata…</option>
          </select>
          {destinationMode === "new" && (
            <div className="mt-2 space-y-2">
              <input
                value={destinationNewCity}
                onChange={(e) => setDestinationNewCity(e.target.value)}
                placeholder="Città"
                className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
              />
              <input
                value={destinationNewName}
                onChange={(e) => setDestinationNewName(e.target.value)}
                placeholder="Nome fermata"
                className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
              />
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
                value={s.isNew ? "__new__" : s.stopId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__new__") {
                    updateIntermediate(i, { isNew: true, stopId: "" });
                  } else {
                    updateIntermediate(i, { isNew: false, stopId: val });
                  }
                }}
                className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
                style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
              >
                <option value="">Seleziona fermata</option>
                {sortedStops.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.city} - {st.name}
                  </option>
                ))}
                <option value="__new__">+ Aggiungi nuova fermata…</option>
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
              {s.isNew && (
                <div className="space-y-2">
                  <input
                    value={s.newCity || ""}
                    onChange={(e) => updateIntermediate(i, { newCity: e.target.value })}
                    placeholder="Città"
                    className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
                    style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
                  />
                  <input
                    value={s.newName || ""}
                    onChange={(e) => updateIntermediate(i, { newName: e.target.value })}
                    placeholder="Nome fermata"
                    className="w-full h-10 px-3 rounded-md border bg-white/80 dark:bg-black/20"
                    style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
                  />
                </div>
              )}
              <button type="button" className="btn w-full" onClick={() => removeIntermediate(i)}>
                Rimuovi fermata
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <button type="button" className="btn w-full" onClick={addIntermediate}>
            + Aggiungi fermata intermedia
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary text-sm disabled:opacity-60"
        >
          {submitting ? "Creazione..." : "Crea corsa"}
        </button>
      </div>
    </form>
  );
}


