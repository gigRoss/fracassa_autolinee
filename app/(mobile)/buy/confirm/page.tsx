'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Force dynamic rendering since this page depends on search parameters
export const dynamic = 'force-dynamic';

interface RideData {
  id: string;
  lineName: string;
  originStop: { id: string; name: string; city: string };
  destinationStop: { id: string; name: string; city: string };
  departureTime: string;
  arrivalTime: string;
  price: string;
  duration?: string;
}

interface UserData {
  nome: string;
  cognome: string;
  email: string;
  passeggeri: string;
}

function ConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rideData, setRideData] = useState<RideData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get ride ID from URL
    const rideId = searchParams.get('rideId');
    
    if (!rideId) {
      setError('Dati corsa mancanti');
      setLoading(false);
      return;
    }

    // Get user data from sessionStorage
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Get ride data from sessionStorage
    const storedRideData = sessionStorage.getItem('rideData');
    if (storedRideData) {
      try {
        const parsedData = JSON.parse(storedRideData);
        setRideData(parsedData);
        setLoading(false);
      } catch (e) {
        console.error('Error parsing ride data:', e);
        setError('Errore nel caricamento dei dati');
        setLoading(false);
      }
    } else {
      setError('Dati corsa non trovati');
      setLoading(false);
    }
  }, [searchParams]);

  const handleConfirmAndPay = () => {
    if (!rideData || !userData) {
      setError('Dati mancanti');
      return;
    }

    // Navigate to payment selection page
    router.push(`/buy/payment?rideId=${rideData.id}`);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="confirm-page">
        <div className="loading-container">
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  if (error || !rideData || !userData) {
    return (
      <div className="confirm-page">
        <header className="frame-256">
          <div className="frame-161">
            <div className="frame-253">
              <button className="frame-back" onClick={handleBack} aria-label="Torna indietro">
                <div className="back-arrow-wrapper">
                  <img className="back-arrow" src="/mobile/search/frame-410.svg" alt="" />
                </div>
              </button>
              <div className="acquista">CONFERMA</div>
              <button className="close-button" onClick={() => router.push('/search')} aria-label="Chiudi">
                <img className="close-icon" src="/mobile/search/frame-580.svg" alt="" />
              </button>
            </div>
          </div>
        </header>
        
        <div className="error-container">
          <p className="error-message">{error || 'Dati non trovati'}</p>
          <button className="back-button" onClick={() => router.push('/search')}>
            Torna alla ricerca
          </button>
        </div>

        <style jsx>{`
          .confirm-page {
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
          
          .error-container {
            position: absolute;
            top: 150px;
            left: 29px;
            right: 29px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
          }
          
          .error-message {
            color: #d32f2f;
            font-size: 14px;
            font-family: Inter, sans-serif;
            text-align: center;
          }
          
          .back-button {
            background: #f49401;
            border-radius: 16px;
            border: 1px solid rgba(0, 0, 0, 0.17);
            padding: 15px 27px;
            color: #ffffff;
            font-size: 14px;
            font-family: Inter, sans-serif;
            font-weight: 600;
            cursor: pointer;
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
            background: linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%);
          }
          
          .frame-253 {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 23px;
          }
          
          .frame-back,
          .close-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: auto;
            height: auto;
            cursor: pointer;
            border: none;
            background: transparent;
            padding: 0;
            transition: opacity 0.2s ease, transform 0.2s ease;
          }
          
          .frame-back:hover,
          .close-button:hover {
            opacity: 0.8;
          }
          
          .frame-back:active,
          .close-button:active {
            transform: scale(0.95);
          }
          
          .back-arrow-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .back-arrow,
          .close-icon {
            display: block;
          }
          
          .back-arrow {
            width: 20px;
            height: 16px;
          }
          
          .close-icon {
            width: 16px;
            height: 16px;
          }
          
          .acquista {
            color: #ffffff;
            font-size: 20px;
            font-family: Inter, sans-serif;
            font-weight: 400;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="confirm-page">
      <header className="frame-256">
        <div className="frame-161">
          <div className="frame-253">
            <button className="frame-back" onClick={handleBack} aria-label="Torna indietro">
              <div className="back-arrow-wrapper">
                <img className="back-arrow" src="/mobile/search/frame-410.svg" alt="" />
              </div>
            </button>
            <div className="acquista">CONFERMA</div>
            <button className="close-button" onClick={() => router.push('/search')} aria-label="Chiudi">
              <img className="close-icon" src="/mobile/search/frame-580.svg" alt="" />
            </button>
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
          {/* Ride Details Section */}
          <div className="section-container">
            <h2 className="section-title">Dettagli Corsa</h2>
            
            <div className="ride-details-card">
              <div className="route-info">
                <div className="route-dots">
                  <div className="dot-start"></div>
                  <div className="dots-middle">
                    <div className="dot-small"></div>
                    <div className="dot-small"></div>
                    <div className="dot-small"></div>
                  </div>
                  <div className="dot-end"></div>
                </div>
                
                <div className="route-text">
                  <div className="stop-info">
                    <span className="stop-label">Da</span>
                    <span className="stop-name">{rideData.originStop.name}</span>
                    <span className="stop-city">{rideData.originStop.city}</span>
                  </div>
                  
                  <div className="stop-info">
                    <span className="stop-label">A</span>
                    <span className="stop-name">{rideData.destinationStop.name}</span>
                    <span className="stop-city">{rideData.destinationStop.city}</span>
                  </div>
                </div>
              </div>

              <div className="time-price-row">
                <div className="info-box">
                  <span className="info-label">Partenza</span>
                  <span className="info-value">{rideData.departureTime}</span>
                </div>
                
                <div className="info-box">
                  <span className="info-label">Arrivo</span>
                  <span className="info-value">{rideData.arrivalTime}</span>
                </div>
                
                <div className="info-box price-box">
                  <span className="info-label">Prezzo</span>
                  <span className="info-value price-value">{rideData.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Data Section */}
          <div className="section-container">
            <h2 className="section-title">Dati Passeggero</h2>
            
            <div className="user-details-card">
              <div className="user-info-row">
                <span className="user-label">Nome:</span>
                <span className="user-value">{userData.nome}</span>
              </div>
              
              <div className="user-info-row">
                <span className="user-label">Cognome:</span>
                <span className="user-value">{userData.cognome}</span>
              </div>
              
              <div className="user-info-row">
                <span className="user-label">Email:</span>
                <span className="user-value">{userData.email}</span>
              </div>
              
              <div className="user-info-row">
                <span className="user-label">Passeggeri:</span>
                <span className="user-value">{userData.passeggeri}</span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button 
            className="frame-37"
            onClick={handleConfirmAndPay}
          >
            <div className="frame-17">
              <span className="continua">Conferma e paga</span>
            </div>
          </button>
        </div>
      </div>

      <style jsx>{`
        .confirm-page {
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
        
        .loading-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
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
          background: linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%);
        }
        
        .frame-253 {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 23px;
        }
        
        .frame-back,
        .close-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: auto;
          height: auto;
          cursor: pointer;
          border: none;
          background: transparent;
          padding: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        
        .frame-back:hover,
        .close-button:hover {
          opacity: 0.8;
        }
        
        .frame-back:active,
        .close-button:active {
          transform: scale(0.95);
        }
        
        .back-arrow-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .back-arrow,
        .close-icon {
          display: block;
        }
        
        .back-arrow {
          width: 20px;
          height: 16px;
        }
        
        .close-icon {
          width: 16px;
          height: 16px;
        }
        
        .acquista {
          color: #ffffff;
          font-size: 20px;
          font-family: Inter, sans-serif;
          font-weight: 400;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .frame-192 {
          position: absolute;
          left: 29px;
          top: 125px;
          right: 29px;
          bottom: 30px;
          width: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
          overflow-y: auto;
          padding-bottom: 20px;
        }
        
        .frame-185 {
          width: 150px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }
        
        .logo-fracassa-ok-323-page-0001-1 {
          width: 100%;
          height: 95px;
          object-fit: contain;
        }
        
        .content-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }
        
        .section-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .section-title {
          color: #232336;
          font-size: 16px;
          font-family: Inter, sans-serif;
          font-weight: 600;
          margin: 0;
          padding-left: 4px;
        }
        
        .ride-details-card,
        .user-details-card {
          background: #fffeff;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        
        .route-info {
          display: flex;
          gap: 16px;
          align-items: stretch;
        }
        
        .route-dots {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          padding-top: 4px;
        }
        
        .dot-start {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: rgba(22, 208, 32, 0.37);
          border: 2.73px solid #16d020;
          flex-shrink: 0;
        }
        
        .dots-middle {
          display: flex;
          flex-direction: column;
          gap: 2.44px;
          align-items: center;
          flex: 1;
          justify-content: center;
        }
        
        .dot-small {
          width: 3.67px;
          height: 3.67px;
          border-radius: 50%;
          background: #d9d9d9;
        }
        
        .dot-end {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: rgba(244, 1, 1, 0.37);
          border: 2.73px solid #f40101;
          flex-shrink: 0;
        }
        
        .route-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
        }
        
        .stop-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .stop-label {
          color: #b9bbbc;
          font-size: 12px;
          font-family: Inter, sans-serif;
          font-weight: 500;
        }
        
        .stop-name {
          color: #232336;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 600;
        }
        
        .stop-city {
          color: #9797a4;
          font-size: 12px;
          font-family: Inter, sans-serif;
          font-weight: 400;
        }
        
        .time-price-row {
          display: flex;
          gap: 12px;
          justify-content: space-between;
        }
        
        .info-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        
        .info-label {
          color: #b9bbbc;
          font-size: 12px;
          font-family: Inter, sans-serif;
          font-weight: 500;
        }
        
        .info-value {
          color: #232336;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 700;
        }
        
        .price-box {
          flex: 1.2;
        }
        
        .price-value {
          color: #f49401;
          font-size: 16px;
        }
        
        .user-details-card {
          gap: 12px;
        }
        
        .user-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .user-info-row:last-child {
          border-bottom: none;
        }
        
        .user-label {
          color: #9797a4;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 500;
        }
        
        .user-value {
          color: #232336;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 600;
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

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="confirm-page">
        <div className="loading-container">
          <p>Caricamento...</p>
        </div>
        <style jsx>{`
          .confirm-page {
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
          
          .loading-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
          }
        `}</style>
      </div>
    }>
      <ConfirmPageContent />
    </Suspense>
  );
}

