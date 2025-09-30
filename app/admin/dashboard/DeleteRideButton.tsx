"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  ride: {
    id: string;
    lineName: string;
    originLabel: string;
    destinationLabel: string;
    departureTime: string;
    arrivalTime: string;
  };
};

export default function DeleteRideButton({ ride }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    };
  }, []);

  async function handleDelete() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/admin/rides/${ride.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Errore eliminazione" }));
        throw new Error(data.error || "Errore eliminazione");
      }
      setDeleted(true);
      setConfirmOpen(false);
      // Give a short undo window before refreshing the list
      undoTimerRef.current = window.setTimeout(() => {
        router.refresh();
      }, 3000);
    } catch (e: any) {
      setError(e.message || "Errore eliminazione");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUndo() {
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/admin/rides/${ride.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Errore ripristino" }));
        throw new Error(data.error || "Errore ripristino");
      }
      // Also remove from cookie via client overwrite to force immediate visibility
      try {
        const current = (document.cookie.match(/(?:^|; )archived_rides=([^;]*)/)?.[1] || "").split(",").filter(Boolean);
        const filtered = current.filter((id) => id !== ride.id);
        document.cookie = `archived_rides=${filtered.join(",")}; path=/; max-age=${60 * 60 * 24 * 7}`;
      } catch {}
      setDeleted(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Errore ripristino");
    } finally {
      setSubmitting(false);
    }
  }

  if (deleted) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-700 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded px-2 py-1">
          Corsa archiviata. Puoi annullare.
        </span>
        <button
          type="button"
          onClick={handleUndo}
          className="btn"
          disabled={submitting}
        >
          {submitting ? "Ripristino..." : "Annulla"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded px-2 py-1">{error}</div>
      )}
      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="btn"
        >
          Elimina
        </button>
      ) : (
        <div className="text-xs p-2 rounded-md border bg-white/80 dark:bg-black/20"
          style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
        >
          <div className="mb-2">
            Confermi l'eliminazione della corsa {ride.lineName} {ride.departureTime} → {ride.arrivalTime}?
            <br />
            {ride.originLabel} → {ride.destinationLabel}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="btn btn-primary disabled:opacity-60"
            >
              {submitting ? "Eliminazione..." : "Conferma eliminazione"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="btn"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


