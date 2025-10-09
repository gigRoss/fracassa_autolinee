import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE } from '@/app/lib/auth';
import { 
  getTopSearchesToday, 
  getDailyStats, 
  getSessionStats,
  getHourlyTrend,
  getRecentSessions
} from '@/app/lib/analytics';
import { formatItalianDate } from '@/app/lib/dateUtils';

// Helper per calcolare durata tra due date
function formatDuration(start: Date | number, end: Date | number): string {
  const startDate = typeof start === 'number' ? new Date(start) : start;
  const endDate = typeof end === 'number' ? new Date(end) : end;
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) return `${diffMins} min`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ore`;
  return `${Math.floor(diffMins / 1440)} giorni`;
}

export default async function AnalyticsPage() {
  // Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  
  if (!session) {
    redirect('/admin/login');
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Fetch analytics data
  const [topSearches, dailyStats, sessionStats, hourlyTrend, recentSessions] = await Promise.all([
    getTopSearchesToday(10),
    getDailyStats(today),
    getSessionStats(),
    getHourlyTrend(today, 'search'),
    getRecentSessions(10),
  ]);

  const totalSearches = dailyStats.search || 0;
  const totalRideViews = dailyStats.view_ride || 0;
  const totalPageviews = dailyStats.pageview || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Statistiche utilizzo - {today}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Ricerche Oggi"
            value={totalSearches}
            icon="🔍"
            color="blue"
            subtitle="Ricerche effettuate"
          />
          <KPICard
            title="Visualizzazioni Corse"
            value={totalRideViews}
            icon="🚌"
            color="green"
            subtitle="Corse visualizzate"
          />
          <KPICard
            title="Sessioni Attive (24h)"
            value={sessionStats?.totalSessions || 0}
            icon="👥"
            color="purple"
            subtitle={`Media ${Math.round(sessionStats?.avgPageviews || 0)} pagine/sessione`}
          />
          <KPICard
            title="PWA Installate"
            value={sessionStats?.pwaInstalls || 0}
            icon="📱"
            color="orange"
            subtitle="Installazioni app"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Searches */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              🔥 Top Ricerche Oggi
            </h2>
            {topSearches.length === 0 ? (
              <p className="text-gray-500 text-sm">Nessuna ricerca oggi</p>
            ) : (
              <div className="space-y-3">
                {topSearches.map((search, i) => (
                  <div key={i} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-gray-400 w-6">
                        #{i + 1}
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {search.route}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {search.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hourly Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              📈 Trend Orario Ricerche
            </h2>
            {hourlyTrend.length === 0 ? (
              <p className="text-gray-500 text-sm">Nessun dato disponibile</p>
            ) : (
              <div className="space-y-2">
                {hourlyTrend.map((h) => (
                  <div key={h.hour} className="flex items-center gap-3">
                    <div className="text-sm text-gray-600 w-12">
                      {h.hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                      <div
                        className="bg-blue-500 h-6 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (h.count / Math.max(...hourlyTrend.map(ht => ht.count))) * 100)}%`
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-2">
                        <span className="text-xs font-semibold text-gray-700">
                          {h.count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            📋 Riepilogo Eventi Oggi
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem label="Pageviews" value={totalPageviews} />
            <StatItem label="Ricerche" value={totalSearches} />
            <StatItem label="Visualizzazioni" value={totalRideViews} />
            <StatItem label="Altri eventi" value={Object.values(dailyStats).reduce((a, b) => a + b, 0) - totalPageviews - totalSearches - totalRideViews} />
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            👤 Sessioni Recenti
          </h2>
          {recentSessions.length === 0 ? (
            <p className="text-gray-500 text-sm">Nessuna sessione registrata</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="pb-2 pr-4">ID Sessione</th>
                    <th className="pb-2 pr-4">Prima Visita</th>
                    <th className="pb-2 pr-4">Ultima Visita</th>
                    <th className="pb-2 pr-4">Durata</th>
                    <th className="pb-2 pr-4 text-center">Pagine</th>
                    <th className="pb-2 pr-4 text-center">Eventi</th>
                    <th className="pb-2 text-center">PWA</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((sess) => (
                    <tr key={sess.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {sess.id}...
                        </code>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">
                        {formatItalianDate(sess.firstSeen, true, true)}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">
                        {formatItalianDate(sess.lastSeen, true, true)}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {formatDuration(sess.firstSeen, sess.lastSeen)}
                      </td>
                      <td className="py-3 pr-4 text-center font-semibold">
                        {sess.pageviews}
                      </td>
                      <td className="py-3 pr-4 text-center text-gray-600">
                        {sess.eventsCount}
                      </td>
                      <td className="py-3 text-center">
                        {sess.isPWA ? (
                          <span className="text-green-600 font-semibold">✓</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Privacy e GDPR</h3>
              <p className="text-sm text-blue-800">
                Questi dati sono raccolti in modo aggregato e anonimo (Livello 1) o con consenso esplicito dell'utente (Livello 2). 
                Non vengono salvati IP, email o dati personali. 
                Gli utenti possono revocare il consenso in qualsiasi momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle 
}: { 
  title: string; 
  value: number; 
  icon: string; 
  color: 'blue' | 'green' | 'purple' | 'orange';
  subtitle?: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 text-white`}>
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-3xl font-bold">{value.toLocaleString('it-IT')}</div>
      </div>
      <div className="p-4">
        <div className="font-semibold text-gray-900 mb-1">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-500">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="text-2xl font-bold text-gray-900">{value.toLocaleString('it-IT')}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}

