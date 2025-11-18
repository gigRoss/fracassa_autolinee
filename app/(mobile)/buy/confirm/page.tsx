'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

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

export default function ConfirmPage() {
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
          {/* User Data Section */}
          <div className="section-container">
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
              
              <div className="user-info-row">
                <span className="user-label">Partenza:</span>
                <span className="user-value">
                  {(() => {
                    // Prendi solo la prima parte prima della virgola se presente
                    const name = rideData.originStop.name.split(',')[0].trim();
                    // Formatta con prima lettera maiuscola e resto minuscolo
                    return name.split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ');
                  })()}
                </span>
              </div>
              
              <div className="user-info-row">
                <span className="user-label">Arrivo:</span>
                <span className="user-value">
                  {(() => {
                    // Prendi solo la prima parte prima della virgola se presente
                    const name = rideData.destinationStop.name.split(',')[0].trim();
                    // Formatta con prima lettera maiuscola e resto minuscolo
                    return name.split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ');
                  })()}
                </span>
              </div>
              
              <div className="user-info-row">
                <span className="user-label">Orario di partenza:</span>
                <span className="user-value">{rideData.departureTime}</span>
              </div>
              
              <div className="user-info-row">
                <span className="user-label">Prezzo:</span>
                <span className="user-value price-value">{rideData.price}</span>
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
          left: 22px;
          top: 125px;
          right: 22px;
          bottom: 30px;
          width: auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: center;
          overflow: hidden;
          padding-bottom: 20px;
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
          object-fit: cover;
          aspect-ratio: 164/117;
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
        
        .user-details-card {
          background: #fffeff;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .price-value {
          color: #f49401;
          font-size: 14px;
          font-weight: 700;
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

