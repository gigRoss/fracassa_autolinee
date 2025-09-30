import Link from "next/link";
import { notFound } from "next/navigation";
import { departures, stopIdToStop, formatDuration } from "@/app/lib/data";

type Params = { id: string };

export default function RideDetail({ params }: { params: Params }) {
  const ride = departures.find((d) => d.id === params.id);
  if (!ride) return notFound();

  const origin = stopIdToStop[ride.originStopId];
  const dest = stopIdToStop[ride.destinationStopId];
  const duration = formatDuration(ride.departureTime, ride.arrivalTime);

  return (

     
    <div className="max-w-2xl w-full mx-auto p-6">
      <div className="mb-4">
        <Link
          href="/"
          className="text-sm text-black/70 dark:text-white/70 hover:underline"
        >
          ← Indietro
        </Link>
      </div>

      <h1 className="text-xl font-semibold mb-2">
        {ride.lineName} • {origin.city} ({origin.name}) → {dest.city} ({dest.name})
      </h1>
      <div className="text-sm text-black/70 dark:text-white/70 mb-6">
        Partenza {ride.departureTime} • Arrivo {ride.arrivalTime} • Durata {duration}
      </div>

      <div className="rounded-md border border-black/10 dark:border-white/15 divide-y divide-black/10 dark:divide-white/10">
        <div className="p-4 flex items-center justify-between">
          <div className="font-medium">Partenza</div>
          <div className="text-sm">
            {origin.city} ({origin.name}) • {ride.departureTime}
          </div>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="font-medium">Arrivo</div>
          <div className="text-sm">
            {dest.city} ({dest.name}) • {ride.arrivalTime}
          </div>
        </div>
      </div>
    </div>
  );
}


