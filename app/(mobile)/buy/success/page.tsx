'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('session_id');
    setSessionId(id);
    
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
          <div className="frame-253">
            <div className="acquista">PAGAMENTO COMPLETATO</div>
          </div>
        </div>
      </header>

      <div className="frame-192">
        <div className="frame-185">
          <img
            className="logo-fracassa-ok-323-page-0001-1"
            src="/mobile/logo-fracassa-new.png"
            alt="Fracassa Autolinee"
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

          {sessionId && (
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
          width: 393px;
          height: 91px;
          position: absolute;
          left: 0;
          top: 0;
          display: flex;
          justify-content: center;
        }
        
        .frame-161 {
          width: 100%;
          height: 100%;
          position: relative;
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
          padding: 16px 23px 20px;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          background: linear-gradient(135deg, rgba(22, 208, 32, 1) 0%, rgba(18, 180, 28, 1) 57%, rgba(15, 150, 23, 1) 75%);
        }
        
        .frame-253 {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 23px;
        }
        
        .acquista {
          color: #ffffff;
          font-size: 18px;
          font-family: Inter, sans-serif;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
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
        }
        
        .content-section {
          width: 100%;
          display: flex;
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




