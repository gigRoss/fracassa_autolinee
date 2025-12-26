import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/app/lib/auth';
import { logoutAction } from '@/app/lib/authActions';
import Image from 'next/image';

const TICKETS_SESSION_COOKIE = 'tickets_admin_session';

async function fetchTickets() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TICKETS_SESSION_COOKIE)?.value;
  const hdrs = await headers();
  const host = hdrs.get('host');
  const proto = hdrs.get('x-forwarded-proto') || 'http';
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/admin/tickets`, {
    headers: {
      Cookie: `${TICKETS_SESSION_COOKIE}=${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) return [] as any[];
  return (await res.json()) as Array<{
    id: string;
    ticketNumber: string;
    passengerName: string;
    passengerSurname: string;
    passengerEmail: string;
    departureDate: string;
    departureTime: string;
    originStopName: string;
    destinationStopName: string;
    amountPaid: number;
    passengerCount: number;
    paymentStatus: string;
    purchaseTimestamp: Date;
  }>;
}

async function logoutTicketsAction() {
  'use server';
  (await cookies()).delete(TICKETS_SESSION_COOKIE);
  redirect('/admin/tickets/login');
}

export default async function TicketsDashboardPage() {
  const token = (await cookies()).get(TICKETS_SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) {
    redirect('/admin/tickets/login');
  }

  const tickets = await fetchTickets();

  // Format amount from cents to euros
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2) + ' €';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Format datetime
  const formatDateTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          <form action={logoutTicketsAction}>
            <button type="submit" aria-label="Logout" className="frame-back">
              <div className="back-arrow-wrapper">
                <Image
                  className="back-arrow"
                  src="/mobile/search/frame-410.svg"
                  alt=""
                  width={18}
                  height={16}
                />
              </div>
            </button>
          </form>
          <div className="acquista">BIGLIETTI</div>
          <form action={logoutTicketsAction}>
            <button type="submit" aria-label="Logout" className="close-button">
              <Image
                className="close-icon"
                src="/mobile/search/frame-580.svg"
                alt=""
                width={16}
                height={16}
              />
            </button>
          </form>
        </div>
      </header>

      {/* Dashboard content */}
      <div className="dashboard-content">
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Tutti i Biglietti ({tickets.length})</h1>
          
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessun biglietto trovato
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="card p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-lg">
                        {ticket.ticketNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {ticket.passengerName} {ticket.passengerSurname}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ticket.passengerEmail}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {formatAmount(ticket.amountPaid)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        ticket.paymentStatus === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : ticket.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ticket.paymentStatus === 'completed' ? 'Pagato' : 
                         ticket.paymentStatus === 'pending' ? 'In attesa' : 'Fallito'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Partenza:</span>
                        <div className="font-medium">{ticket.originStopName}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(ticket.departureDate)} alle {ticket.departureTime}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Destinazione:</span>
                        <div className="font-medium">{ticket.destinationStopName}</div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Passeggeri: {ticket.passengerCount} • 
                      Acquisto: {formatDateTime(ticket.purchaseTimestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

