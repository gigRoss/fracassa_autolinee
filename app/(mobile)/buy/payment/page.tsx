'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Force dynamic rendering since this page depends on search parameters
export const dynamic = 'force-dynamic';

interface UserData {
  nome: string;
  cognome: string;
  email: string;
  passeggeri: string;
}

interface RideData {
  id: string;
  price: string;
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [rideData, setRideData] = useState<RideData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user data from sessionStorage
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Get ride data from sessionStorage
    const storedRideData = sessionStorage.getItem('rideData');
    if (storedRideData) {
      try {
        setRideData(JSON.parse(storedRideData));
      } catch (e) {
        console.error('Error parsing ride data:', e);
      }
    }
  }, []);

  const handleStripePayment = async () => {
    if (!userData || !rideData) {
      setError('Dati mancanti');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a payment intent
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rideId: rideData.id,
          userData: userData,
          amount: rideData.price,
          rideData: rideData, // Include full ride data for ticket creation
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante la creazione del pagamento');
      }

      const { sessionId, url } = await response.json();

      // Redirect to Stripe Checkout URL
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('URL di pagamento non disponibile');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Errore durante il pagamento');
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="payment-page">
      <header className="frame-256">
        <div className="frame-161">
          <button className="frame-back" onClick={handleBack} aria-label="Torna indietro">
            <div className="back-arrow-wrapper">
              <img className="back-arrow" src="/mobile/search/frame-410.svg" alt="" />
            </div>
          </button>
          <div className="acquista">PAGAMENTO</div>
          <button className="close-button" onClick={() => router.push('/search')} aria-label="Chiudi">
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
          />
        </div>

        <div className="content-section">
          <h2 className="section-title">Seleziona Metodo di Pagamento</h2>

          <div className="payment-methods">
            {/* Stripe Payment Button */}
            <button 
              className="payment-method-card stripe-card"
              onClick={handleStripePayment}
              disabled={loading}
            >
              <div className="payment-icon-container">
                <svg className="stripe-icon" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#6772E5"
                    d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z"
                  />
                </svg>
              </div>
              <div className="payment-info">
                <span className="payment-name">Stripe</span>
                <span className="payment-desc">Pagamento sicuro con carta</span>
              </div>
              <div className="payment-arrow">
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 1L6.5 6L1.5 11" stroke="#9797A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>

            {/* Security Badge */}
            <div className="security-badge">
              <svg className="lock-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.6667 7.33333H3.33333C2.59695 7.33333 2 7.93029 2 8.66667V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V8.66667C14 7.93029 13.403 7.33333 12.6667 7.33333Z" stroke="#16D020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.66602 7.33333V4.66667C4.66602 3.78261 5.01721 2.93476 5.64233 2.30964C6.26745 1.68452 7.1153 1.33333 7.99935 1.33333C8.8834 1.33333 9.73126 1.68452 10.3564 2.30964C10.9815 2.93476 11.3327 3.78261 11.3327 4.66667V7.33333" stroke="#16D020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="security-text">Pagamento sicuro e protetto</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p className="loading-text">Reindirizzamento a Stripe...</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .payment-page {
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
          height: 91px;
          left: 0px;
          top: 0px;
          position: absolute;
          background: linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%);
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
          z-index: 1000;
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
        }
        
        .content-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
          position: relative;
        }
        
        .section-title {
          color: #232336;
          font-size: 16px;
          font-family: Inter, sans-serif;
          font-weight: 600;
          margin: 0;
          text-align: center;
        }
        
        .payment-methods {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .payment-method-card {
          background: #fffeff;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        
        .payment-method-card:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.3);
        }
        
        .payment-method-card:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .payment-method-card:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .stripe-card {
          border: 2px solid #6772E5;
        }
        
        .payment-icon-container {
          width: 60px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .stripe-icon {
          width: 60px;
          height: 25px;
        }
        
        .payment-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .payment-name {
          color: #232336;
          font-size: 16px;
          font-family: Inter, sans-serif;
          font-weight: 600;
        }
        
        .payment-desc {
          color: #9797a4;
          font-size: 12px;
          font-family: Inter, sans-serif;
          font-weight: 400;
        }
        
        .payment-arrow {
          width: 8px;
          height: 12px;
          flex-shrink: 0;
        }
        
        .security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: rgba(22, 208, 32, 0.08);
          border-radius: 12px;
        }
        
        .lock-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }
        
        .security-text {
          color: #16d020;
          font-size: 12px;
          font-family: Inter, sans-serif;
          font-weight: 600;
        }
        
        .error-message {
          color: #d32f2f;
          font-size: 14px;
          font-family: Inter, sans-serif;
          text-align: center;
          padding: 12px;
          background: rgba(211, 47, 47, 0.1);
          border-radius: 8px;
          width: 100%;
        }
        
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          z-index: 9999;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .loading-text {
          color: #ffffff;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="payment-page">
        <div className="loading-container">
          <p>Caricamento...</p>
        </div>
        <style jsx>{`
          .payment-page {
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
      <PaymentPageContent />
    </Suspense>
  );
}

