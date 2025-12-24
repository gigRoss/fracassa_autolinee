import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE } from "@/app/lib/auth";
import { logoutAction } from "@/app/lib/authActions";
import Image from "next/image";
import Link from "next/link";
import SimplifiedDashboard from "./SimplifiedDashboard";
import { Stop } from "@/app/lib/data";
import { normalizeStopName, normalizeCity } from "@/app/lib/textUtils";

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

export default async function AdminDashboardPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) {
    redirect("/admin/login");
  }

  const [rides, stops] = await Promise.all([fetchRides(), fetchStops()]);
  const stopIdToStop = Object.fromEntries(stops.map((s) => [s.id, s] as const));

  // Format rides with labels for SimplifiedDashboard
  const formattedRides = rides.map((ride) => {
    const origin = stopIdToStop[ride.originStopId];
    const destination = stopIdToStop[ride.destinationStopId];
    
    const originLabel = origin
      ? `${normalizeCity(origin.city)} (${normalizeStopName(origin.name)})`
      : ride.originStopId;
    
    const destinationLabel = destination
      ? `${normalizeCity(destination.city)} (${normalizeStopName(destination.name)})`
      : ride.destinationStopId;

    const intermediateStops = (ride.intermediateStops || []).map((stop: { stopId: string; time: string; fascia?: number | null }) => {
      const stopData = stopIdToStop[stop.stopId];
      const label = stopData
        ? `${normalizeCity(stopData.city)} (${normalizeStopName(stopData.name)})`
        : stop.stopId;
      
      return {
        stopId: stop.stopId,
        time: stop.time,
        label,
        fascia: stop.fascia ?? null,
      };
    });

    return {
      id: ride.id,
      lineName: ride.lineName,
      originStopId: ride.originStopId,
      destinationStopId: ride.destinationStopId,
      departureTime: ride.departureTime,
      arrivalTime: ride.arrivalTime,
      originLabel,
      destinationLabel,
      originFascia: ride.originFascia ?? null,
      destinationFascia: ride.destinationFascia ?? null,
      intermediateStops,
    };
  });

  return (
    <div className="amministrazione-page">
      {/* Bottom vector line */}
      <Image
        className="vector-3"
        src="/mobile/search/vector-30.svg"
        alt=""
        width={90}
        height={1}
      />

      {/* Orange header */}
      <header className="frame-256">
        <div className="frame-161">
          <Link href="/admin/general" aria-label="Indietro" className="frame-back">
            <div className="back-arrow-wrapper">
              <Image
                className="back-arrow"
                src="/mobile/search/frame-410.svg"
                alt=""
                width={18}
                height={16}
              />
            </div>
          </Link>
          <div className="acquista">ADMIN</div>
          <form action={logoutAction}>
            <button type="submit" aria-label="Logout" className="close-button">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </form>
        </div>
      </header>

      {/* Dashboard content */}
      <div className="dashboard-content">
        <SimplifiedDashboard rides={formattedRides} />
      </div>
    </div>
  );
}
