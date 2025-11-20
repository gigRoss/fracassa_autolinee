'use client';

import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
interface UserData {
  nome: string;
  cognome: string;
  email: string;
}

export default function BuyPage() {
  const router = useRouter();
  const [nomeCognome, setNomeCognome] = useState('');
  const [userData, setUserData] = useState<UserData>({
    nome: '',
    cognome: '',
    email: '',
  });
  const [passeggeri, setPasseggeri] = useState('1');
  const [showPasseggeriDropdown, setShowPasseggeriDropdown] = useState(false);
  const passeggeriDropdownRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Split nome e cognome from the single field
  const splitNomeCognome = (fullName: string) => {
    const trimmed = fullName.trim();
    if (!trimmed) return { nome: '', cognome: '' };
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return { nome: parts[0], cognome: '' };
    }
    return {
      nome: parts[0],
      cognome: parts.slice(1).join(' '),
    };
  };

  const isFormValid =
    nomeCognome.trim().length > 0 &&
    userData.email.trim().length > 0 &&
    isValidEmail(userData.email) &&
    passeggeri.trim().length > 0;

  const passeggeriOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  useEffect(() => {
    if (!showPasseggeriDropdown) {
      return;
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        passeggeriDropdownRef.current &&
        !passeggeriDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPasseggeriDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPasseggeriDropdown]);

  const handleUserDataSubmit = async (event?: FormEvent<HTMLFormElement> | React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }

    if (!isFormValid) {
      setErrorMessage(
        'Per continuare è necessario compilare tutti i campi obbligatori con dati validi.'
      );
      return;
    }

    // Split nome e cognome from the single field
    const { nome, cognome } = splitNomeCognome(nomeCognome);
    const completeFormData = {
      nome,
      cognome,
      email: userData.email,
      passeggeri: passeggeri,
    };

    // Save user data to sessionStorage
    sessionStorage.setItem('userData', JSON.stringify(completeFormData));

    // Get ride ID from URL
    const searchParams = new URLSearchParams(window.location.search);
    const rideId = searchParams.get('rideId');

    if (!rideId) {
      setErrorMessage('Dati corsa mancanti');
      return;
    }

    // Fetch ride data from API
    try {
      const fromStopId = searchParams.get('from');
      const toStopId = searchParams.get('to');
      const dateParam = searchParams.get('date');
      
      if (!fromStopId || !toStopId) {
        setErrorMessage('Dati percorso mancanti');
        return;
      }

      const response = await fetch(`/api/search?origin=${encodeURIComponent(fromStopId)}&destination=${encodeURIComponent(toStopId)}&useIntermediate=true`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ride data');
      }
      
      const data = await response.json();
      const ride = data.results?.find((r: any) => r.id === rideId);
      
      if (!ride) {
        setErrorMessage('Corsa non trovata');
        return;
      }

      // Add date to ride data if available
      const rideDataWithDate = {
        ...ride,
        // Only include date if it's a valid non-empty string
        ...(dateParam && dateParam.trim() !== '' ? { date: dateParam } : {}),
      };

      // Save ride data to sessionStorage
      sessionStorage.setItem('rideData', JSON.stringify(rideDataWithDate));

      setErrorMessage(null);
      
      // Navigate to confirmation page
      router.push(`/buy/confirm?rideId=${rideId}`);
    } catch (error) {
      console.error('Error fetching ride data:', error);
      setErrorMessage('Errore nel caricamento dei dati della corsa');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="buy">
      <img className="vector-3" src="/mobile/search/vector-30.svg" alt="" />
      
      <div className="frame-267">
        <div className="frame-185">
          <img
            className="logo-fracassa-ok-323-page-0001-1"
            src="/mobile/logo-fracassa-new.png"
            alt="Fracassa Autolinee"
          />
        </div>

        <div className="frame-266">
          <form className="frame-265" onSubmit={handleUserDataSubmit} noValidate>
            <div className="frame-264">
              <div className="frame-49">
                <input
                  type="text"
                  placeholder="Nome e Cognome"
                  value={nomeCognome}
                  onChange={(e) => {
                    setNomeCognome(e.target.value);
                    if (errorMessage) {
                      setErrorMessage(null);
                    }
                  }}
                  className="input-field nome-e-cognome"
                  required
                  aria-required="true"
                />
              </div>

              <div className="frame-257">
                <input
                  type="email"
                  placeholder="Email"
                  value={userData.email}
                  onChange={(e) => {
                    setUserData({ ...userData, email: e.target.value });
                    if (errorMessage) {
                      setErrorMessage(null);
                    }
                  }}
                  className="input-field email"
                  required
                  aria-required="true"
                  aria-invalid={userData.email.trim().length > 0 && !isValidEmail(userData.email)}
                />
                {userData.email.trim().length > 0 && !isValidEmail(userData.email) && (
                  <p className="input-hint" role="status">
                    Inserisci un indirizzo email valido
                  </p>
                )}
              </div>
            </div>

            <div className="frame-258" ref={passeggeriDropdownRef}>
              <div className="passeggeri-wrapper" onClick={() => setShowPasseggeriDropdown(!showPasseggeriDropdown)}>
                <span className="passeggeri-e">
                  {passeggeri} {passeggeri === '1' ? 'passeggero' : 'passeggeri'}
                </span>
                <img className="vector-5" src="/mobile/search/vector-50.svg" alt="" aria-hidden="true" />
              </div>
              {showPasseggeriDropdown && (
                <div className="dropdown-menu">
                  {passeggeriOptions.map((option) => (
                    <div
                      key={option}
                      className="dropdown-item"
                      onClick={() => {
                        setPasseggeri(option);
                        setShowPasseggeriDropdown(false);
                        if (errorMessage) {
                          setErrorMessage(null);
                        }
                      }}
                    >
                      {option} {option === '1' ? 'passeggero' : 'passeggeri'}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
          </form>

          <div className="frame-37">
            <button 
              type="button"
              onClick={handleUserDataSubmit}
              disabled={!isFormValid}
              className="frame-17"
            >
              <div className="frame-35">
                <span className="continua">Continua</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <header className="frame-256">
        <div className="frame-161">
          <div className="frame-253">
            <button className="frame-back" onClick={handleBack} aria-label="Torna indietro">
              <div className="back-arrow-wrapper">
                <img className="back-arrow" src="/mobile/search/frame-410.svg" alt="" />
              </div>
            </button>
            <div className="acquista">ACQUISTA</div>
            <button className="close-button" onClick={() => router.push('/search')} aria-label="Chiudi">
              <img className="close-icon" src="/mobile/search/frame-580.svg" alt="" />
            </button>
          </div>
        </div>
      </header>

      <style jsx>{`
        .buy,
        .buy * {
          box-sizing: border-box;
        }
        
        .buy {
          background: #ffffff;
          height: 852px;
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 393px;
          margin: 0 auto;
        }
        
        .vector-3 {
          width: 90px;
          height: 0px;
          position: absolute;
          left: 152px;
          top: 844px;
          overflow: visible;
        }
        
        .frame-267 {
          display: flex;
          flex-direction: column;
          gap: 42px;
          align-items: center;
          justify-content: flex-start;
          width: 342px;
          position: absolute;
          left: 22px;
          top: 125px;
        }
        
        .frame-185 {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          justify-content: flex-start;
          flex-shrink: 0;
          width: 184px;
          position: relative;
        }
        
        .logo-fracassa-ok-323-page-0001-1 {
          align-self: stretch;
          flex-shrink: 0;
          height: 117px;
          position: relative;
          object-fit: cover;
          aspect-ratio: 164/117;
          width: 100%;
        }
        
        .frame-266 {
          display: flex;
          flex-direction: column;
          gap: 42px;
          align-items: center;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
        }
        
        .frame-265 {
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: flex-start;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
        }
        
        .frame-264 {
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: flex-start;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
        }
        
        .frame-49 {
          background: #fffefe;
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 14px 20px 14px 20px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          height: 45px;
        }
        
        .frame-257 {
          background: #fffefe;
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 14px 20px 14px 20px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          height: 45px;
        }
        
        .frame-258 {
          background: #fffefe;
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 14px 21px 14px 21px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          height: 45px;
        }
        
        .passeggeri-wrapper {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          gap: 12px;
        }
        
        .nome-e-cognome,
        .email {
          color: rgba(151, 151, 164, 0.8);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          flex: 1;
        }
        
        .nome-e-cognome::placeholder,
        .email::placeholder {
          color: rgba(151, 151, 164, 0.8);
        }
        
        .passeggeri-e {
          color: rgba(151, 151, 164, 0.8);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          flex: 1;
          margin-right: 8px;
        }
        
        .vector-5 {
          width: 12.5px;
          height: 8px;
          position: relative;
          overflow: visible;
          flex-shrink: 0;
        }
        
        .frame-37 {
          background: #F49401;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          width: 109px;
          height: 47px;
          padding: 0;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: background-color 0.2s, transform 0.2s;
          flex-shrink: 0;
          position: relative;
        }
        
        .frame-37:hover {
          background: #e68501;
        }
        
        .frame-37:active {
          transform: scale(0.95);
        }
        
        .frame-37:has(button:disabled) {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .frame-17 {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        
        .frame-17:disabled {
          cursor: not-allowed;
        }
        
        .frame-35 {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .continua {
          color: #ffffff;
          text-align: center;
          font-family: "Inter-SemiBold", sans-serif;
          font-size: 14px;
          font-weight: 600;
          position: relative;
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
        
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.17);
          border-radius: 16px;
          box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
          z-index: 20;
          max-height: 220px;
          overflow-y: auto;
        }
        
        .dropdown-item {
          padding: 12px 16px;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 500;
          color: rgba(151, 151, 164, 0.8);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .dropdown-item:hover {
          background-color: rgba(244, 148, 1, 0.08);
          color: #232336;
        }
        
        .dropdown-item:first-child {
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }
        
        .dropdown-item:last-child {
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
        }
        
        .input-hint {
          color: #d32f2f;
          font-size: 12px;
          font-family: Inter, sans-serif;
          margin-top: 6px;
          padding: 0 8px;
        }
        
        .error-message {
          color: #d32f2f;
          font-size: 12px;
          font-family: Inter, sans-serif;
          text-align: center;
          padding: 0 8px;
        }
      `}</style>
    </div>
  );
}
