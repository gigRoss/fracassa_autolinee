'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface PassengerTicket {
  id: string;
  name: string;
  ticketCode: string;
  validated: boolean;
}

/**
 * Driver Ride Tickets Page
 * Shows the list of passengers and ticket codes for a specific ride,
 * based on the Figma design (frame-240).
 */
export default function DriverRideTicketsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const rideId = params.id;

  // TODO: replace with real data from API (e.g. /api/tickets?rideId=...)
  const initialPassengers: PassengerTicket[] = [
    { id: '1', name: 'Mario Rossi', ticketCode: '12345678', validated: false },
    { id: '2', name: 'Maria Bianchi', ticketCode: '12345679', validated: false },
    { id: '3', name: 'Gianluca Rosato', ticketCode: '12345680', validated: false },
    { id: '4', name: 'Gianvito Sammaritani', ticketCode: '12345681', validated: false },
    { id: '5', name: 'Marco Stupefacente', ticketCode: '12345682', validated: false },
  ];

  const [passengers, setPassengers] = useState<PassengerTicket[]>(initialPassengers);

  // Persist validation state per ride in localStorage so it stays green even after leaving the page
  useEffect(() => {
    if (!rideId) return;
    try {
      const stored = localStorage.getItem(`driver_tickets_validated_${rideId}`);
      if (!stored) return;
      const validatedIds: string[] = JSON.parse(stored);
      setPassengers((prev) =>
        prev.map((p) => ({
          ...p,
          validated: validatedIds.includes(p.id),
        })),
      );
    } catch {
      // ignore parse errors
    }
  }, [rideId]);

  const handleToggleValidated = (id: string) => {
    setPassengers((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, validated: !p.validated } : p,
      );

      // Save to localStorage
      try {
        if (rideId) {
          const validatedIds = updated.filter((p) => p.validated).map((p) => p.id);
          localStorage.setItem(
            `driver_tickets_validated_${rideId}`,
            JSON.stringify(validatedIds),
          );
        }
      } catch {
        // ignore storage errors
      }

      return updated;
    });
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

        <div className="header-title">BIGLIETTI</div>

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
        <div className="frame-240">
          <div className="frame-94">
            <div className="frame-78">
              {[...passengers, ...passengers].map((passenger, index) => (
                <div key={passenger.id} className="ticket-card">
                  <div className="ticket-inner">
                    <div className="ticket-shape" />
                    <div className="frame-76">
                      <div className="frame-70">
                        <div className="frame-69">
                          <div className="passenger-name">
                            {passenger.name}
                          </div>
                          <div
                            className={
                              passenger.validated
                                ? 'status-dot status-dot--active'
                                : 'status-dot'
                            }
                            onClick={() => handleToggleValidated(passenger.id)}
                            role="button"
                            aria-pressed={passenger.validated}
                            aria-label={
                              passenger.validated
                                ? 'Biglietto validato'
                                : 'Segna biglietto come validato'
                            }
                          />
                        </div>
                      </div>
                      <div className="frame-74">
                        <div className="codice-ticket">Codice Ticket:</div>
                      </div>
                      <div className="frame-75">
                        <div className="ticket-code">
                          {/* TODO: sostituire con il vero numero del biglietto dal backend */}
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
      </div>

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
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
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
          z-index: 10;
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

        .header-title {
          color: #ffffff;
          font-family: Inter, sans-serif;
          font-size: 20px;
          font-weight: 400;
          letter-spacing: 0.5px;
          text-transform: uppercase;
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
          height: 122px;
          display: flex;
          align-items: center;
          padding-right: 13px;
          background: transparent;
        }

        .ticket-inner {
          position: relative;
          width: 334px;
          height: 122px;
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
          height: 122px;
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

        .frame-74 {
          width: 140px;
          height: 19px;
          position: absolute;
          left: 0;
          top: 49px;
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
          width: 120px;
          height: 19px;
          position: absolute;
          right: 0;
          top: 49px;
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
      `}</style>
    </div>
  );
}


