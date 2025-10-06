import { cookies, headers } from "next/headers";
import { SESSION_COOKIE } from "@/app/lib/auth";

import EditRideForm from "./EditRideForm";
import DeleteRideButton from "./DeleteRideButton";
import { Suspense } from "react";
import { cookies as serverCookies } from "next/headers";

async function fetchRides() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const archived = cookieStore.get("archived_rides")?.value;
  const hdrs = await headers();
  const host = hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/admin/rides`, {
    headers: {
      Cookie: `${SESSION_COOKIE}=${token}${archived ? `; archived_rides=${archived}` : ""}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return [] as any[];
  return (await res.json()) as Array<{
    id: string;
    lineName: string;
    originStopId: string;
    destinationStopId: string;
    departureTime: string;
    arrivalTime: string;
    originFascia?: number | null;
    destinationFascia?: number | null;
    intermediateStops?: Array<{ stopId: string; time: string; fascia?: number | null }>;
  }>;
}

async function fetchStops(): Promise<Stop[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const hdrs = await headers();
  const host = hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/admin/stops`, {
    headers: {
      Cookie: `${SESSION_COOKIE}=${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return (await res.json()) as Stop[];
}

export default async function RidesList() {
  const [rides, stops] = await Promise.all([fetchRides(), fetchStops()]);
  const stopIdToStop = Object.fromEntries(stops.map((s) => [s.id, s] as const));
  return (
    <ul className="divide-y" style={{ borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}>
      {rides.map((d) => {
        const origin = stopIdToStop[d.originStopId];
        const dest = stopIdToStop[d.destinationStopId];
        return (
          <li key={d.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium">
                {d.lineName} • {origin.city} ({origin.name}) → {dest.city} ({dest.name})
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-black/60 dark:text-white/60">
                  {d.departureTime} → {d.arrivalTime}
                </div>
                <DeleteRideButton
                  ride={{
                    id: d.id,
                    lineName: d.lineName,
                    originLabel: `${origin.city} (${origin.name})`,
                    destinationLabel: `${dest.city} (${dest.name})`,
                    departureTime: d.departureTime,
                    arrivalTime: d.arrivalTime,
                  }}
                />
              </div>
            </div>
            <div className="card p-3" style={{ background: "color-mix(in oklab, var(--neutral-0) 60%, transparent)" }}>
              {/* Inline edit form */}
              <EditRideForm
                ride={{
                  id: d.id,
                  lineName: d.lineName,
                  originStopId: d.originStopId,
                  destinationStopId: d.destinationStopId,
                  departureTime: d.departureTime,
                  arrivalTime: d.arrivalTime,
                 
                  intermediateStops: (d as any).intermediateStops || [],
                }}
              />
            </div>
          </li>
        );
      })}
      {rides.length === 0 && (
        <li className="p-4 text-sm text-black/60 dark:text-white/60">Nessuna corsa presente</li>
      )}
    </ul>
  );
}


