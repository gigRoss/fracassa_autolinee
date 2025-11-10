'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CancelPage() {
  const router = useRouter();

  const handleTryAgain = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/search');
  };

  return (
    <div className="cancel-page">
      <header className="frame-256">
        <div className="frame-161">
          <div className="frame-253">
            <div className="acquista">PAGAMENTO ANNULLATO</div>
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
          {/* Cancel Icon */}
          <div className="cancel-icon-container">
            <svg className="cancel-icon" width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="38" fill="#F49401" fillOpacity="0.1" stroke="#F49401" strokeWidth="4"/>
              <path d="M30 30L50 50M50 30L30 50" stroke="#F49401" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="cancel-message-container">
            <h1 className="cancel-title">Pagamento Annullato</h1>
            <p className="cancel-message">
              Il pagamento è stato annullato.
            </p>
            <p className="cancel-info">
              Nessun addebito è stato effettuato. Puoi riprovare quando vuoi.
            </p>
          </div>

          <div className="info-card">
            <div className="info-text">
              <p className="info-title">Hai bisogno di aiuto?</p>
              <p className="info-desc">
                Se stai riscontrando problemi con il pagamento, contatta il nostro servizio clienti.
              </p>
            </div>
          </div>

          <div className="button-group">
            <button className="frame-37 primary" onClick={handleTryAgain}>
              <div className="frame-17">
                <span className="continua">Riprova</span>
              </div>
            </button>
            
            <button className="frame-37 secondary" onClick={handleGoHome}>
              <div className="frame-17">
                <span className="continua">Torna alla Home</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cancel-page {
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
          background: linear-gradient(135deg, rgba(244, 148, 1, 1) 0%, rgba(240, 130, 1, 1) 57%, rgba(235, 110, 1, 1) 75%);
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
        
        .cancel-icon-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .cancel-icon {
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
        
        .cancel-message-container {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .cancel-title {
          color: #f49401;
          font-size: 24px;
          font-family: Inter, sans-serif;
          font-weight: 700;
          margin: 0;
        }
        
        .cancel-message {
          color: #232336;
          font-size: 16px;
          font-family: Inter, sans-serif;
          font-weight: 500;
          margin: 0;
        }
        
        .cancel-info {
          color: #9797a4;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 400;
          margin: 0;
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
        
        .info-text {
          flex: 1;
        }
        
        .info-title {
          color: #232336;
          font-size: 16px;
          font-family: Inter, sans-serif;
          font-weight: 600;
          margin: 0 0 8px 0;
        }
        
        .info-desc {
          margin: 0;
          color: #9797a4;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 400;
          line-height: 1.6;
        }
        
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        
        .frame-37 {
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          padding: 15px 27px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 47px;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.2s ease;
        }
        
        .frame-37.primary {
          background: #f49401;
        }
        
        .frame-37.secondary {
          background: #ffffff;
          border: 2px solid #f49401;
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
        
        .frame-37.primary .continua {
          color: #ffffff;
        }
        
        .frame-37.secondary .continua {
          color: #f49401;
        }
        
        .continua {
          font-size: 14px;
          font-family: "Inter-SemiBold", sans-serif;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}

