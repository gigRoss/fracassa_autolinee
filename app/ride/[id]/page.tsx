import Link from "next/link";
import { notFound } from "next/navigation";
import { listStops } from "@/app/lib/stopsStore";
import { getRideById } from "@/app/lib/ridesStore";
import { formatDuration } from "@/app/lib/data";
type Params = { id: string };

export default async function RideDetail({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const ride = await getRideById(id);
  if (!ride || ride.archived) return notFound();

  const stops = await listStops();
  const stopIdToStop = Object.fromEntries(stops.map((s) => [s.id, s] as const));
  const origin = stopIdToStop[ride.originStopId];
  const dest = stopIdToStop[ride.destinationStopId];
  if (!origin || !dest) return notFound();
  const duration = formatDuration(ride.departureTime, ride.arrivalTime);

  return (

     
    <div className="max-w-2xl w-full mx-auto p-6">
      <div className="mb-4">
        <Link
          href="/"
          className="btn"
          aria-label="Torna alla lista delle corse disponibili"
        >
          ← Torna alla lista
        </Link>
      </div>

      <h1 className="text-xl font-semibold mb-2">
         {origin.name} → {dest.name}
      </h1>
      <div className="text-sm text-black/70 dark:text-white/70 mb-6">
        Partenza {ride.departureTime} • Arrivo {ride.arrivalTime} • Durata {duration}
        {ride.price && ` • Prezzo €${ride.price}`}
      </div>

      <div className="rounded-md border border-black/10 dark:border-white/15 divide-y divide-black/10 dark:divide-white/10">
        <div className="p-4 flex items-center justify-between">
          {/*  <div className="font-medium">Partenza</div> */}
          <div className="text-sm">
            {origin.name} • {ride.departureTime}
          </div>
        </div>
        {ride.intermediateStops && ride.intermediateStops.length > 0 && (
          <>
            {ride.intermediateStops.map((s, idx) => {
              const via = stopIdToStop[s.stopId];
              if (!via) return null;
              return (
                <div className="p-4 flex items-center justify-between" key={`${s.stopId}-${s.time}-${idx}`}>
                  {/* <div className="font-medium">Fermata intermedia</div> */}
                  <div className="text-sm">
                    {via.name} • {s.time}
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div className="p-4 flex items-center justify-between">
          {/* <div className="font-medium">Arrivo</div> */}
          <div className="text-sm">
            {dest.city} ({dest.name}) • {ride.arrivalTime}
          </div>
        </div>
      </div>
    </div>
  );
}


