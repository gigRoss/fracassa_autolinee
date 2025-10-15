"use client";

import { useEffect, useMemo, useState } from "react";
import { toItalianISO } from "@/app/lib/dateUtils";

type AuditChange = {
  field: string;
  before?: string;
  after?: string;
};

type AuditEvent = {
  id: string;
  when: string;
  timestamp: number;
  actor: string;
  type: "ride.updated" | "ride.created" | "ride.deleted";
  rideId: string;
  description: string;
  changes?: AuditChange[];
};

export default function RecentChanges() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [actor, setActor] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (actor) p.set("actor", actor);
    if (type) p.set("type", type);
    if (from) {
      const isoFrom = toItalianISO(new Date(from));
      if (isoFrom) p.set("from", isoFrom);
    }
    if (to) {
      const isoTo = toItalianISO(new Date(to));
      if (isoTo) p.set("to", isoTo);
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [actor, type, from, to]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/admin/audit${qs}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: AuditEvent[]) => {
        if (!cancelled) setEvents(data);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [qs]);

  return (
    <div className="rounded-md border border-black/10 dark:border-white/15">
      <div className="p-4 border-b border-black/10 dark:border-white/10 font-medium flex items-center justify-between">
        <span>Storico modifiche recente</span>
        <div className="flex gap-2 items-center">
          <input
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="Filtra per utente"
            className="h-8 px-2 rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20 text-sm"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-8 px-2 rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20 text-sm"
          >
            <option value="">Tutte le azioni</option>
            <option value="ride.created">Create</option>
            <option value="ride.updated">Update</option>
            <option value="ride.deleted">Delete</option>
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 px-2 rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20 text-sm"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 px-2 rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20 text-sm"
          />
          {/* no manual refresh button */}
        </div>
      </div>
      <div className="max-h-80 overflow-auto">
        {loading ? (
          <div className="p-4 text-sm text-black/60 dark:text-white/60">Caricamento…</div>
        ) : events.length === 0 ? (
          <div className="p-4 text-sm text-black/60 dark:text-white/60">Nessuna modifica trovata</div>
        ) : (
          <ul className="divide-y divide-black/10 dark:divide-white/10">
            {events.map((e) => (
              <li key={e.id} className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm">{e.description}</div>
                  <div className="text-xs text-black/60 dark:text-white/60">{e.when}</div>
                </div>
                <div className="text-xs text-black/60 dark:text-white/60">{e.actor} • {e.type} • ride {e.rideId}</div>
                {e.changes && e.changes.length > 0 && (
                  <div className="mt-1">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-black/60 dark:text-white/60">
                          <th className="py-1 pr-2">Campo</th>
                          <th className="py-1 pr-2">Prima</th>
                          <th className="py-1 pr-2">Dopo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {e.changes.map((c, idx) => (
                          <tr key={idx}>
                            <td className="py-1 pr-2 align-top">{c.field}</td>
                            <td className="py-1 pr-2 align-top">{c.before ?? "—"}</td>
                            <td className="py-1 pr-2 align-top">{c.after ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


