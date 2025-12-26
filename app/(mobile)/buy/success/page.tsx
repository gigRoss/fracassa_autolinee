'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Force dynamic rendering since this page depends on search parameters
export const dynamic = 'force-dynamic';

interface TicketInfo {
  ticketNumber: string;
  passengerName: string;
  passengerSurname: string;
  departureDate: string;
  departureTime: string;
  passengerCount: number;
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get('session_id');
    setSessionId(id);
    
    // Fetch ticket information
    const fetchTicket = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        // Wait a bit for the webhook to process (in real scenario, use polling or websockets)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For now, we'll just show the session ID
        // In the future, you can fetch the ticket from the API using the session ID
        // const response = await fetch(`/api/tickets/by-session?sessionId=${id}`);
        // if (response.ok) {
        //   const data = await response.json();
        //   setTicket(data.ticket);
        // }
      } catch (error) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
    
    // Clear session storage
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('rideData');
  }, [searchParams]);

  const handleGoHome = () => {
    router.push('/search');
  };

  return (
    <div className="success-page">
      <header className="frame-256">
        <div className="frame-161">
          <button className="frame-back" onClick={handleGoHome} aria-label="Torna indietro">
            <div className="back-arrow-wrapper">
              <img className="back-arrow" src="/mobile/search/frame-410.svg" alt="" />
            </div>
          </button>
          <div className="acquista">PAGAMENTO COMPLETATO</div>
          <button className="close-button" onClick={handleGoHome} aria-label="Chiudi">
            <img className="close-icon" src="/mobile/search/frame-580.svg" alt="" />
          </button>
        </div>
      </header>

      <div className="frame-192">
        <div className="frame-185">
          <img
            className="logo-fracassa-ok-323-page-0001-1"
            src="/mobile/logo-fracassa-new.png"
            alt="Fracassa Autolinee"
            role="button"
            aria-label="Torna alla pagina principale"
            onClick={handleGoHome}
          />
        </div>

        <div className="content-section">
          {/* Success Icon */}
          <div className="success-icon-container">
            <svg className="success-icon" width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="38" fill="#16D020" fillOpacity="0.1" stroke="#16D020" strokeWidth="4"/>
              <path d="M25 40L35 50L55 30" stroke="#16D020" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="success-message-container">
            <h1 className="success-title">Pagamento Completato!</h1>
            <p className="success-message">
              Il tuo biglietto è stato acquistato con successo.
            </p>
            <p className="success-info">
              Riceverai una conferma via email con tutti i dettagli del tuo viaggio.
            </p>
          </div>

          {ticket && (
            <div className="ticket-info-card">
              <div className="ticket-header">
                <span className="ticket-icon">🎫</span>
                <span className="ticket-title">Biglietto Generato</span>
              </div>
              <div className="ticket-number-container">
                <span className="ticket-label">Numero Biglietto:</span>
                <span className="ticket-number">{ticket.ticketNumber}</span>
              </div>
              <div className="ticket-details">
                <div className="ticket-detail-row">
                  <span className="detail-label">Passeggero:</span>
                  <span className="detail-value">{ticket.passengerName} {ticket.passengerSurname}</span>
                </div>
                <div className="ticket-detail-row">
                  <span className="detail-label">Data partenza:</span>
                  <span className="detail-value">{ticket.departureDate}</span>
                </div>
                <div className="ticket-detail-row">
                  <span className="detail-label">Orario:</span>
                  <span className="detail-value">{ticket.departureTime}</span>
                </div>
                <div className="ticket-detail-row">
                  <span className="detail-label">Passeggeri:</span>
                  <span className="detail-value">{ticket.passengerCount}</span>
                </div>
              </div>
            </div>
          )}

          {sessionId && !ticket && !loading && (
            <div className="session-id-container">
              <span className="session-label">ID Transazione:</span>
              <span className="session-value">{sessionId.slice(0, 20)}...</span>
            </div>
          )}

          <div className="info-card">
            <div className="info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#6772E5" strokeWidth="2"/>
                <path d="M12 8V12L14 14" stroke="#6772E5" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="info-text">
              <p className="info-title">Cosa succede ora?</p>
              <ul className="info-list">
                <li>Controlla la tua email per la conferma</li>
                <li>Conserva il biglietto elettronico</li>
                <li>Mostra il biglietto al conducente</li>
              </ul>
            </div>
          </div>
          <button className="frame-37" onClick={handleGoHome}>
            <div className="frame-17">
              <span className="continua">Torna alla Home</span>
            </div>
          </button>

        </div>
      </div>

      <style jsx>{`
        .success-page {
          display: flex;
          width: 100%;
          max-width: 393px;
          min-height: 852px;
          position: relative;
          background: #ffffff;
          overflow: hidden;
          margin: 0 auto;
          box-sizing: border-box;
        }
        
        .frame-256 {
          width: 100%;
          max-width: 393px;
          height: 91px;
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          top: 0;
          display: flex;
          justify-content: center;
          z-index: 1000;
        }
        
        .frame-161 {
          width: 100%;
          height: 91px;
          left: 0px;
          top: 0px;
          position: absolute;
          background: linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%);
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
        }
        
        .frame-back {
          display: flex;
          align-items: center;
          justify-content: center;
          width: auto;
          height: auto;
          position: absolute;
          left: 21px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          padding: 0;
        }
        
        .frame-back:hover {
          opacity: 0.8;
        }
        
        .frame-back:active {
          transform: translateY(-50%) scale(0.95);
        }
        
        .back-arrow-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .back-arrow {
          width: 18px;
          height: 16px;
          position: relative;
          overflow: visible;
        }
        
        .close-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: auto;
          height: auto;
          position: absolute;
          right: 21px;
          top: 50%;
          transform: translateY(-50%);
          overflow: visible;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          padding: 0;
        }
        
        .close-button:hover {
          opacity: 0.8;
        }
        
        .close-button:active {
          transform: translateY(-50%) scale(0.95);
        }
        
        .close-icon {
          width: 16px;
          height: 16px;
          position: relative;
          overflow: visible;
        }
        
        .acquista {
          color: #ffffff;
          font-size: 20px;
          font-family: Inter, sans-serif;
          font-weight: 400;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        
        .frame-192 {
          position: absolute;
          left: 29px;
          top: 125px;
          right: 29px;
          width: auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: center;
          padding-bottom: 40px;
        }
        
        .frame-185 {
          width: 184px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
        }
        
        .logo-fracassa-ok-323-page-0001-1 {
          width: 100%;
          height: 117px;
          object-fit: contain;
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }

        .logo-fracassa-ok-323-page-0001-1:hover {
          transform: scale(1.02);
          opacity: 0.95;
        }
        
        .content-section {
          width: 100%;
          display: relative;
          flex-direction: column;
          gap: 24px;
          align-items: center;
        }
        
        .success-icon-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .success-icon {
          animation: scaleIn 0.5s ease-out;
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .success-message-container {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .success-title {
          color: #16d020;
          font-size: 24px;
          font-family: Inter, sans-serif;
          font-weight: 700;
          margin: 0;
        }
        
        .success-message {
          color: #232336;
          font-size: 16px;
          font-family: Inter, sans-serif;
          font-weight: 500;
          margin: 0;
        }
        
        .success-info {
          color: #9797a4;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 400;
          margin: 0;
        }
        
        .session-id-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px;
          background: rgba(103, 114, 229, 0.05);
          border-radius: 8px;
          width: 100%;
          text-align: center;
        }
        
        .session-label {
          color: #9797a4;
          font-size: 12px;
          font-family: Inter, sans-serif;
          font-weight: 500;
        }
        
        .session-value {
          color: #6772E5;
          font-size: 11px;
          font-family: "Courier New", monospace;
          font-weight: 600;
          word-break: break-all;
        }

        .ticket-info-card {
          background: linear-gradient(135deg, rgba(255,169,37,0.05) 0%, rgba(250,159,19,0.05) 57%, rgba(244,148,1,0.05) 75%);
          border-radius: 16px;
          border: 2px solid #f49401;
          box-shadow: 0px 4px 8px rgba(244, 148, 1, 0.2);
          padding: 20px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ticket-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(244, 148, 1, 0.2);
        }

        .ticket-icon {
          font-size: 24px;
        }

        .ticket-title {
          color: #f49401;
          font-size: 18px;
          font-family: Inter, sans-serif;
          font-weight: 700;
        }

        .ticket-number-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 12px;
          background: #ffffff;
          border-radius: 8px;
          text-align: center;
        }

        .ticket-label {
          color: #9797a4;
          font-size: 12px;
          font-family: Inter, sans-serif;
          font-weight: 500;
          text-transform: uppercase;
        }

        .ticket-number {
          color: #232336;
          font-size: 18px;
          font-family: "Courier New", monospace;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .ticket-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ticket-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .detail-label {
          color: #9797a4;
          font-size: 13px;
          font-family: Inter, sans-serif;
          font-weight: 500;
        }

        .detail-value {
          color: #232336;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 600;
        }
        
        .info-card {
          background: #fffeff;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          padding: 20px;
          display: flex;
          gap: 16px;
          width: 100%;
        }
        
        .info-icon {
          flex-shrink: 0;
        }
        
        .info-text {
          flex: 1;
        }
        
        .info-title {
          color: #232336;
          font-size: 16px;
          font-family: Inter, sans-serif;
          font-weight: 600;
          margin: 0 0 12px 0;
        }
        
        .info-list {
          margin: 0;
          padding-left: 20px;
          color: #9797a4;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 400;
          line-height: 1.6;
        }
        
        .info-list li {
          margin-bottom: 8px;
        }
        
        .info-list li:last-child {
          margin-bottom: 0;
        }
        
        .frame-37 {
          background: #f49401;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          padding: 15px 27px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          justify-content: center;
          min-width: 180px;
          height: 47px;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.2s ease;
        }
        
        .frame-37:hover {
          filter: brightness(0.95);
        }
        
        .frame-37:active {
          transform: translateY(1px);
        }
        
        .frame-17 {
          display: flex;
          flex-direction: row;
          gap: 1px;
          align-items: center;
          justify-content: flex-start;
        }
        
        .continua {
          color: #ffffff;
          font-size: 14px;
          font-family: "Inter-SemiBold", sans-serif;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <SuccessContent />
    </Suspense>
  );
}




