'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { normalizeStopName, normalizeCity } from '@/app/lib/textUtils';

interface PassengerTicket {
  id: string;
  name: string;
  ticketCode: string;
  validated: boolean;
  departureDate?: string;
  passengerCount?: number;
  originStopId: string;
  destinationStopId: string;
  isValidating?: boolean;
}

interface ApiTicket {
  id: string;
  name: string;
  ticketCode: string;
  departureDate: string;
  departureTime: string;
  passengerCount: number;
  originStopId: string;
  destinationStopId: string;
  validated: boolean;
}

interface Stop {
  id: string;
  name: string;
}

/**
 * Driver Ride Tickets Page
 * Shows the list of passengers and ticket codes for a specific ride,
 * fetched from the database.
 */
export default function DriverRideTicketsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rideId = params.id;
  const dateParam = searchParams.get('date');

  const [passengers, setPassengers] = useState<PassengerTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmTicket, setConfirmTicket] = useState<PassengerTicket | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  // Format the date for display
  const formatDateDisplay = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    return `${dayNames[date.getDay()]} ${day}/${month}`;
  };

  // Fetch tickets from API
  useEffect(() => {
    if (!rideId) return;

    async function fetchTickets() {
      setLoading(true);
      setError(null);
      
      try {
        // Include date parameter if available
        const url = dateParam 
          ? `/api/driver/rides/${rideId}/tickets?date=${dateParam}`
          : `/api/driver/rides/${rideId}/tickets`;
          
        
        const res = await fetch(url, {
          cache: 'no-store',
        });
        
        if (!res.ok) {
          throw new Error('Errore nel caricamento dei biglietti');
        }
        
        const stopsRes = await fetch('/api/stops', { cache: 'no-store' });

        if (stopsRes.ok) {
          const stopsData = await stopsRes.json();
          setStops(stopsData);
        }
        const data: ApiTicket[] = await res.json();
        
        // Transform API data to PassengerTicket format
        // validated field now comes from the database
        const tickets: PassengerTicket[] = data.map((ticket) => ({
          id: ticket.id,
          name: ticket.name,
          ticketCode: ticket.ticketCode,
          validated: ticket.validated ?? false,
          departureDate: ticket.departureDate,
          passengerCount: ticket.passengerCount,
          originStopId: ticket.originStopId ,
          destinationStopId: ticket.destinationStopId ,
          isValidating: false,
        }));
        
        setPassengers(tickets);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Errore nel caricamento dei biglietti');
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [rideId, dateParam]);


  const stopIdToStop = Object.fromEntries(stops.map((s) => [s.id, s] as const));

  const getStopLabel = (passengerTicket:PassengerTicket): string => {
    const origin = stopIdToStop[passengerTicket.originStopId];
    const dest = stopIdToStop[passengerTicket.destinationStopId];
    
    if (!origin || !dest) return 'N/A';
    
    const originName = normalizeStopName(origin.name);
    const destName = normalizeStopName(dest.name);
    
    return `${originName} → ${destName}`;
  };
  // Show confirmation popup before validating
  const handleRequestValidation = (id: string) => {
    const ticket = passengers.find((p) => p.id === id);
    if (!ticket || ticket.isValidating) return;
    setConfirmTicket(ticket);
  };

  // Actually perform the validation after confirmation
  const handleConfirmValidation = async () => {
    if (!confirmTicket) return;
    
    const id = confirmTicket.id;
    const newValidated = !confirmTicket.validated;
    
    // Close popup
    setConfirmTicket(null);
    
    // Optimistic update + set loading state
    setPassengers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, validated: newValidated, isValidating: true } : p,
      ),
    );
    
    try {
      // Call API to persist validation
      const res = await fetch(`/api/driver/rides/${rideId}/tickets`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: id, validated: newValidated }),
      });
      
      if (!res.ok) {
        throw new Error('Errore nella validazione del biglietto');
      }
      
      // Clear loading state on success
      setPassengers((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isValidating: false } : p,
        ),
      );
    } catch (err) {
      console.error('Error validating ticket:', err);
      // Revert on error
      setPassengers((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, validated: !newValidated, isValidating: false } : p,
        ),
      );
    }
  };

  const handleCancelValidation = () => {
    setConfirmTicket(null);
  };

  const handleBack = () => {
    router.back();
  };

  const handleClose = () => {
    // Chiudi: torna alla pagina principale del sito
    router.push('/');
  };

  return (
    <div className="driver-tickets-page">
      {/* Top orange header with back arrow and close (white icons) */}
      <div className="header-bar">
        <button
          className="icon-button"
          onClick={handleBack}
          aria-label="Indietro"
        >
          <svg
            width="18"
            height="16"
            viewBox="0 0 23 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.93086 17.1115C9.63081 17.4115 9.22392 17.58 8.79966 17.58C8.3754 17.58 7.9685 17.4115 7.66846 17.1115L0.468459 9.91154C0.168505 9.61149 7.322e-07 9.2046 7.69291e-07 8.78034C8.06381e-07 8.35608 0.168506 7.94918 0.468459 7.64914L7.66846 0.449139C7.97022 0.157687 8.37439 -0.00358318 8.7939 6.18039e-05C9.21342 0.00370678 9.61472 0.171977 9.91137 0.468631C10.208 0.765284 10.3763 1.16658 10.3799 1.5861C10.3836 2.00561 10.2223 2.40978 9.93086 2.71154L5.59966 7.18034L20.7997 7.18034C21.224 7.18034 21.631 7.34891 21.931 7.64897C22.2311 7.94903 22.3997 8.35599 22.3997 8.78034C22.3997 9.20469 22.2311 9.61165 21.931 9.91171C21.631 10.2118 21.224 10.3803 20.7997 10.3803L5.59966 10.3803L9.93086 14.8491C10.2308 15.1492 10.3993 15.5561 10.3993 15.9803C10.3993 16.4046 10.2308 16.8115 9.93086 17.1115Z"
              fill="#FFFFFF"
            />
          </svg>
        </button>

        <div className="header-title-container">
          <div className="header-title">BIGLIETTI</div>
          {dateParam && <div className="header-date">{formatDateDisplay(dateParam)}</div>}
        </div>

        <button
          className="icon-button"
          onClick={handleClose}
          aria-label="Chiudi"
        >
          <Image
            className="close-icon"
            src="/mobile/search/frame-580.svg"
            alt=""
            width={16}
            height={16}
          />
        </button>
      </div>

      {/* Contenuto scrollabile: lista biglietti */}
      <div className="content">
        {loading ? (
          <div className="loading-message">Caricamento biglietti...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : passengers.length === 0 ? (
          <div className="empty-message">Nessun biglietto per questa corsa</div>
        ) : (
        <div className="frame-240">
          <div className="frame-94">
            <div className="frame-78">
              {passengers.map((passenger) => (
                <div key={passenger.id} className="ticket-card">
                  <div className="ticket-inner">
                    <div className="ticket-shape" />
                    <div className="frame-76">
                      <div className="frame-70">
                        <div className="frame-69">
                          <div className="passenger-name">
                            {passenger.name}
                            {passenger.passengerCount && passenger.passengerCount > 1 && (
                              <span className="passenger-count"> ({passenger.passengerCount} passeggeri)</span>
                            )}
                          </div>
                          <div
                            className={`status-dot ${
                              passenger.validated ? 'status-dot--active' : ''
                            } ${passenger.isValidating ? 'status-dot--loading' : ''}`}
                            onClick={() => handleRequestValidation(passenger.id)}
                            role="button"
                            aria-pressed={passenger.validated}
                            aria-label={
                              passenger.isValidating
                                ? 'Validazione in corso...'
                                : passenger.validated
                                ? 'Biglietto validato'
                                : 'Segna biglietto come validato'
                            }
                          />
                        </div>
                      </div>
                      <div className="frame-74">
                        <div className="tratta">{getStopLabel(passenger)}</div>
                      </div>
                      <div className="frame-90">
                        <div className="codice-ticket">Codice Ticket:</div>
                      </div>
                      <div className="frame-75">
                        <div className="ticket-code">
                          #{passenger.ticketCode}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmTicket && (
        <div className="modal-overlay" onClick={handleCancelValidation}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {confirmTicket.validated ? 'Annulla validazione' : 'Conferma validazione'}
            </div>
            <div className="modal-body">
              <p className="modal-message">
                {confirmTicket.validated
                  ? 'Vuoi annullare la validazione del biglietto di:'
                  : 'Vuoi validare il biglietto di:'}
              </p>
              <p className="modal-passenger">{confirmTicket.name}</p>
              <p className="modal-ticket">#{confirmTicket.ticketCode}</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn--cancel" onClick={handleCancelValidation}>
                Annulla
              </button>
              <button className="modal-btn modal-btn--confirm" onClick={handleConfirmValidation}>
                {confirmTicket.validated ? 'Annulla validazione' : 'Valida'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .driver-tickets-page,
        .driver-tickets-page * {
          box-sizing: border-box;
        }

        .driver-tickets-page {
          background: #ffffff;
          width: 100%;
          max-width: 393px;
          height: 852px;
          position: relative;
          margin: 0 auto;
          overflow: hidden;
        }

        .header-bar {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          top: 0;
          width: 100%;
          max-width: 393px;
          height: 91px;
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
          padding: 16px 23px 20px;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          background: linear-gradient(
            135deg,
            rgba(255, 169, 37, 1) 0%,
            rgba(250, 159, 19, 1) 57%,
            rgba(244, 148, 1, 1) 75%
          );
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
        }

        .icon-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .icon-button:hover {
          opacity: 0.8;
        }

        .icon-button:active {
          transform: scale(0.95);
        }

        .header-title-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .header-title {
          color: #ffffff;
          font-family: Inter, sans-serif;
          font-size: 20px;
          font-weight: 400;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .header-date {
          color: rgba(255, 255, 255, 0.9);
          font-family: Inter, sans-serif;
          font-size: 13px;
          font-weight: 500;
        }

        .content {
          position: absolute;
          top: 91px;
          left: 0;
          right: 0;
          bottom: 0;
          overflow-y: auto;
          padding: 24px 23px 24px;
          background: #ffffff;
        }

        .content::-webkit-scrollbar {
          display: none;
        }

        .content {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .loading-message,
        .error-message,
        .empty-message {
          text-align: center;
          font-family: 'Inter-Medium', sans-serif;
          font-size: 16px;
          padding: 60px 20px;
        }

        .loading-message {
          color: rgba(0, 0, 0, 0.5);
        }

        .error-message {
          color: #dc3545;
        }

        .empty-message {
          color: rgba(0, 0, 0, 0.5);
        }

        .frame-240 {
          display: flex;
          flex-direction: column;
          gap: 2px;
          align-items: center;
          justify-content: flex-start;
          position: relative;
        }

        .frame-94 {
          padding: 10px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
        }

        .frame-78 {
          display: flex;
          flex-direction: column;
          gap: 21px;
          align-items: center; /* centra orizzontalmente i biglietti */
          justify-content: flex-start;
          flex-shrink: 0;
          width: 100%;
          position: relative;
        }

        .ticket-card {
          align-self: stretch;
          flex-shrink: 0;
          height: 180px;
          display: flex;
          align-items: center;
          padding-right: 13px;
          background: transparent;
        }

        .ticket-inner {
          position: relative;
          width: 334px;
          height: 180px;
          padding: 27px 26px;
          display: inline-flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          gap: 10px;
        }

        /* Rettangolo semplice per il biglietto (senza PNG, senza mezzelune) */
        .ticket-shape {
          width: 334px;
          height: 162px;
          position: absolute;
          left: 0;
          top: 0;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.16);
        }

        .frame-76 {
          width: 271px;
          height: 68px;
          position: relative;
        }

        .frame-70 {
          display: flex;
          flex-direction: column;
          gap: 17px;
          align-items: flex-start;
          justify-content: flex-start;
          width: 271px;
          position: absolute;
          left: 0;
          top: 0;
        }

        .frame-69 {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
        }

        .passenger-name {
          color: rgba(0, 0, 0, 0.6);
          text-align: left;
          font-family: 'Inter-Bold', sans-serif;
          font-size: 16px;
          font-weight: 700;
          position: relative;
        }

        .passenger-count {
          font-size: 12px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.4);
        }

        .status-dot {
          background: #ffffff;
          border-radius: 24px;
          border-style: solid;
          border-color: #edecec;
          border-width: 1px;
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          position: relative;
          cursor: pointer;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }

        .status-dot--active {
          background: rgba(22, 208, 32, 0.6);
          border-color: rgba(22, 208, 32, 0.8);
        }

        .status-dot--loading {
          opacity: 0.5;
          pointer-events: none;
          animation: pulse 0.8s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .frame-74 {
          width: 100%;
          height: 19px;
          position: absolute;
          left: 0;
          top: 49px;
        }
          .frame-90 {
          width: 200px;
          height: 30px;
          position: absolute;
          left: 0;
          top: 100px;
        }

         .tratta {
          color: rgba(0, 0, 0, 0.4);
          text-align: left;
          font-family: 'Inter-Bold', sans-serif;
          font-size: 16px;
          font-weight: 700;
          position: absolute;
          left: 0;
          top: 0;
          white-space: nowrap;
        }

        .codice-ticket {
          color: rgba(0, 0, 0, 0.4);
          text-align: left;
          font-family: 'Inter-Bold', sans-serif;
          font-size: 16px;
          font-weight: 700;
          position: absolute;
          left: 0;
          top: 0;
        }

        .frame-75 {
          width: 180px;
          height: 19px;
          position: absolute;
          right: 0;
          top: 100px;
          text-align: right;
        }

        .ticket-code {
          color: rgba(0, 0, 0, 0.4);
          text-align: right;
          font-family: 'Inter-Bold', sans-serif;
          font-size: 16px;
          font-weight: 700;
          position: absolute;
          right: 0;
          top: 0;
        }

        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .modal-content {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 320px;
          box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .modal-header {
          background: linear-gradient(
            135deg,
            rgba(255, 169, 37, 1) 0%,
            rgba(250, 159, 19, 1) 57%,
            rgba(244, 148, 1, 1) 75%
          );
          color: #ffffff;
          font-family: 'Inter-Bold', sans-serif;
          font-size: 18px;
          font-weight: 700;
          padding: 16px 20px;
          text-align: center;
        }

        .modal-body {
          padding: 24px 20px;
          text-align: center;
        }

        .modal-message {
          font-family: 'Inter-Medium', sans-serif;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.6);
          margin: 0 0 12px 0;
        }

        .modal-passenger {
          font-family: 'Inter-Bold', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.8);
          margin: 0 0 8px 0;
        }

        .modal-ticket {
          font-family: 'Inter-Medium', sans-serif;
          font-size: 14px;
          color: rgba(244, 148, 1, 1);
          margin: 0;
        }

        .modal-actions {
          display: flex;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .modal-btn {
          flex: 1;
          padding: 16px;
          font-family: 'Inter-Medium', sans-serif;
          font-size: 16px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .modal-btn--cancel {
          background: #f5f5f5;
          color: rgba(0, 0, 0, 0.6);
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }

        .modal-btn--cancel:hover {
          background: #ebebeb;
        }

        .modal-btn--confirm {
          background: rgba(22, 208, 32, 0.15);
          color: rgba(22, 168, 32, 1);
        }

        .modal-btn--confirm:hover {
          background: rgba(22, 208, 32, 0.25);
        }
      `}</style>
    </div>
  );
}


