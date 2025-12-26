'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface TicketInfo {
  id: string;
  ticketNumber: string;
  passengerName: string;
  passengerSurname: string;
  passengerEmail: string;
  passengerCount: number;
  amountPaid: number;
  validated: boolean;
  purchaseTimestamp: string;
  originStopName: string;
  destinationStopName: string;
}

interface RideGroup {
  rideId: string;
  rideName: string;
  departureTime: string;
  tickets: TicketInfo[];
}

interface DateGroup {
  date: string;
  rides: RideGroup[];
}

export default function TicketsArchivePage() {
  const router = useRouter();
  const [dateGroups, setDateGroups] = useState<DateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRides, setExpandedRides] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/tickets/archive', { cache: 'no-store' });

        if (res.ok) {
          const data = await res.json();
          setDateGroups(data);
        } else if (res.status === 401) {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Error fetching archived tickets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/admin/logout', { method: 'POST' });
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/admin/login';
    }
  };

  const formatDateHeader = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const monthNames = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];

    const dayName = dayNames[date.getDay()];
    const dayNum = date.getDate();
    const monthName = monthNames[date.getMonth()];
    const yearStr = date.getFullYear();

    return `${dayName} ${dayNum} ${monthName} ${yearStr}`;
  };

  const formatAmount = (cents: number): string => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const toggleRide = (rideKey: string) => {
    setExpandedRides(prev => {
      const next = new Set(prev);
      if (next.has(rideKey)) {
        next.delete(rideKey);
      } else {
        next.add(rideKey);
      }
      return next;
    });
  };

  const getTotalPassengers = (tickets: TicketInfo[]): number => {
    return tickets.reduce((sum, t) => sum + t.passengerCount, 0);
  };

  const getTotalAmount = (tickets: TicketInfo[]): number => {
    return tickets.reduce((sum, t) => sum + t.amountPaid, 0);
  };

  return (
    <div className="archive-page">
      {/* Header bar */}
      <div className="header-bar">
        <div className="back-button" onClick={handleBack}>
          <Image
            src="/mobile/search/frame-410.svg"
            alt="Indietro"
            width={18}
            height={16}
            className="back-arrow"
          />
        </div>
        <div className="header-title">ARCHIVIO BIGLIETTI</div>
        <div className="logout-button" onClick={handleLogout}>
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
        </div>
      </div>

      {/* Content */}
      <div className="content-container">
        {loading ? (
          <div className="loading-message">Caricamento...</div>
        ) : dateGroups.length === 0 ? (
          <div className="no-tickets-message">Nessun biglietto acquistato</div>
        ) : (
          <div className="dates-list">
            {dateGroups.map((dateGroup) => (
              <div key={dateGroup.date} className="date-group">
                <div className="date-header">{formatDateHeader(dateGroup.date)}</div>
                
                {dateGroup.rides.map((ride) => {
                  const rideKey = `${dateGroup.date}-${ride.rideId}`;
                  const isExpanded = expandedRides.has(rideKey);
                  const totalPassengers = getTotalPassengers(ride.tickets);
                  const totalAmount = getTotalAmount(ride.tickets);

                  return (
                    <div key={rideKey} className="ride-group">
                      <button
                        className="ride-header"
                        onClick={() => toggleRide(rideKey)}
                      >
                        <div className="ride-info">
                          <span className="ride-time">{ride.departureTime}</span>
                          <span className="ride-name">{ride.rideName}</span>
                        </div>
                        <div className="ride-stats">
                          <span className="ticket-count">{ride.tickets.length} big.</span>
                          <span className="passenger-count">{totalPassengers} pass.</span>
                          <span className="total-amount">{formatAmount(totalAmount)}</span>
                          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                            ▼
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="tickets-list">
                          {ride.tickets.map((ticket) => (
                            <div
                              key={ticket.id}
                              className={`ticket-card ${ticket.validated ? 'validated' : ''}`}
                            >
                              <div className="ticket-header">
                                <span className="ticket-number">{ticket.ticketNumber}</span>
                                {ticket.validated && (
                                  <span className="validated-badge">✓ Validato</span>
                                )}
                              </div>
                              <div className="ticket-passenger">
                                <strong>{ticket.passengerName} {ticket.passengerSurname}</strong>
                                {ticket.passengerCount > 1 && (
                                  <span className="multi-passenger"> ({ticket.passengerCount} passeggeri)</span>
                                )}
                              </div>
                              <div className="ticket-email">{ticket.passengerEmail}</div>
                              <div className="ticket-route">
                                {ticket.originStopName} → {ticket.destinationStopName}
                              </div>
                              <div className="ticket-amount">{formatAmount(ticket.amountPaid)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .archive-page,
        .archive-page * {
          box-sizing: border-box;
        }

        .archive-page {
          background: #ffffff;
          min-height: 100vh;
          position: relative;
          width: 100%;
          max-width: 393px;
          margin: 0 auto;
        }

        .header-bar {
          width: 100%;
          height: 70px;
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          max-width: 393px;
          top: 0;
          background: linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%);
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 21px;
        }

        .back-button {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 8px;
        }

        .back-button:hover {
          opacity: 0.8;
        }

        .back-button:active {
          transform: scale(0.95);
        }

        .header-title {
          color: #ffffff;
          font-size: 16px;
          font-family: Inter, sans-serif;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .logout-button {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 8px;
        }

        .logout-button:hover {
          opacity: 0.8;
        }

        .logout-button:active {
          transform: scale(0.95);
        }

        .content-container {
          padding: 90px 16px 20px;
        }

        .loading-message,
        .no-tickets-message {
          text-align: center;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.6);
          padding: 40px 20px;
        }

        .dates-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .date-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .date-header {
          font-family: "Inter-Bold", sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #F49401;
          padding: 8px 4px;
          border-bottom: 2px solid #F49401;
          text-transform: capitalize;
        }

        .ride-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ride-header {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          cursor: pointer;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
          text-align: left;
        }

        .ride-header:hover {
          background: #fef3e2;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
        }

        .ride-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ride-time {
          font-family: "Inter-Bold", sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #F49401;
        }

        .ride-name {
          font-family: "Inter-Medium", sans-serif;
          font-size: 13px;
          color: #333;
          line-height: 1.3;
        }

        .ride-stats {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          color: #666;
        }

        .ticket-count,
        .passenger-count {
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .total-amount {
          font-weight: 600;
          color: #2e7d32;
        }

        .expand-icon {
          margin-left: auto;
          font-size: 10px;
          color: #999;
          transition: transform 0.2s ease;
        }

        .expand-icon.expanded {
          transform: rotate(180deg);
        }

        .tickets-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-left: 8px;
          border-left: 3px solid #F49401;
          margin-left: 8px;
        }

        .ticket-card {
          background: #fafafa;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ticket-card.validated {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border-color: #4caf50;
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ticket-number {
          font-family: "Inter-Bold", monospace;
          font-size: 12px;
          font-weight: 700;
          color: #666;
        }

        .validated-badge {
          font-family: "Inter-Medium", sans-serif;
          font-size: 11px;
          color: #2e7d32;
          background: #c8e6c9;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .ticket-passenger {
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          color: #333;
        }

        .multi-passenger {
          font-weight: 400;
          color: #666;
          font-size: 12px;
        }

        .ticket-email {
          font-family: "Inter-Regular", sans-serif;
          font-size: 12px;
          color: #888;
        }

        .ticket-route {
          font-family: "Inter-Regular", sans-serif;
          font-size: 12px;
          color: #666;
        }

        .ticket-amount {
          font-family: "Inter-Bold", sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #2e7d32;
          text-align: right;
        }
      `}</style>
    </div>
  );
}

