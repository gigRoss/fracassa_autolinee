import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE } from "@/app/lib/auth";
import { fetchKpis } from "@/app/lib/adminData";
import RecentChanges from "./RecentChanges";
import CreateRideForm from "./CreateRideForm";
import RidesList from "./RidesList";

export default async function AdminDashboardPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) {
    redirect("/admin/login");
  }

  const kpis = await fetchKpis();

  return (
    <div className="max-w-4xl w-full mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard amministratore</h1>
        <div className="text-sm text-black/70 dark:text-white/70">Benvenuto, {session.sub}</div>
        <form action="/admin/logout" method="post" className="mt-3">
          <button className="btn" type="submit">
            Logout
          </button>
        </form>
      </div>

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
    </div>
  );
}


