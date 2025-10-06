import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE } from "@/app/lib/auth";
import { logoutAction } from "@/app/lib/authActions";
// import { fetchKpis } from "@/app/lib/adminData";
import { Stop } from "@/app/lib/data";
import SimplifiedDashboard from "./SimplifiedDashboard";
// import RecentChanges from "./RecentChanges";
// import CreateRideForm from "./CreateRideForm";
// import RidesList from "./RidesList";

async function fetchRides() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const hdrs = await headers();
  const host = hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/admin/rides`, {
    headers: {
      Cookie: `${SESSION_COOKIE}=${token}`,
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
    intermediateStops?: Array<{ stopId: string; time: string }>;
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

export default async function AdminDashboardPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) {
    redirect("/admin/login");
  }

  // const kpis = await fetchKpis();
  const [rides, stops] = await Promise.all([fetchRides(), fetchStops()]);
  const stopIdToStop = Object.fromEntries(stops.map((s) => [s.id, s] as const));

  const ridesWithLabels = rides.map((r) => {
    const origin = stopIdToStop[r.originStopId];
    const dest = stopIdToStop[r.destinationStopId];
    const intermediateStopsWithLabels = r.intermediateStops?.map((s: { stopId: string; time: string }) => {
      const stop = stopIdToStop[s.stopId];
      return {
        ...s,
        label: stop ? `${stop.city} (${stop.name})` : s.stopId,
      };
    });
    return {
      ...r,
      originLabel: origin ? `${origin.city} (${origin.name})` : "N/A",
      destinationLabel: dest ? `${dest.city} (${dest.name})` : "N/A",
      intermediateStops: intermediateStopsWithLabels,
    };
  });

  return (
    <div className="max-w-4xl w-full mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard amministratore</h1>
        <div className="text-sm text-black/70 dark:text-white/70">Benvenuto, {session.sub}</div>
        <form action={logoutAction} className="mt-3">
          <button className="btn" type="submit">
            Logout
          </button>
        </form>
      </div>

      <SimplifiedDashboard rides={ridesWithLabels} />

      {/* CODICE ORIGINALE COMMENTATO - DA RIATTIVARE SE NECESSARIO */}
      {/* 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-xs text-black/60 dark:text-white/60">Corse odierne programmate</div>
          <div className="text-2xl font-semibold mt-1">{kpis.scheduledToday}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-black/60 dark:text-white/60">Modificate/Eliminate (7 giorni)</div>
          <div className="text-2xl font-semibold mt-1">{kpis.changedLast7d}</div>
        </div>
        <div className="card p-4 sm:col-span-2 lg:col-span-1">
          <div className="text-xs text-black/60 dark:text-white/60">Stato</div>
          <div className="text-sm mt-1">Operativo</div>
        </div>
      </div>

      <RecentChanges />

      <div className="card">
        <div className="p-4 border-b border-black/10 dark:border-white/10 font-medium">Crea nuova corsa</div>
        <div className="p-4">
          <CreateRideForm />
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-black/10 dark:border-white/10 font-medium">Corse</div>
        <RidesList />
      </div>
      */}
    </div>
  );
}


