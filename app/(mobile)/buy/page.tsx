'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
interface UserData {
  nome: string;
  cognome: string;
  email: string;
}

export default function BuyPage() {
  const router = useRouter();
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

  const isFormValid =
    userData.nome.trim().length > 0 &&
    userData.cognome.trim().length > 0 &&
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

  const handleUserDataSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid) {
      setErrorMessage(
        'Per continuare è necessario compilare tutti i campi obbligatori con dati validi.'
      );
      return;
    }

    const completeFormData = {
      ...userData,
      passeggeri: passeggeri,
    };
    console.log('Form submitted:', completeFormData);
    setErrorMessage(null);
    // TODO: Process payment and redirect to confirmation
    router.push('/buy/payment'); // o la pagina successiva appropriata
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="buy">
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

      <div className="frame-192">
        <div className="frame-185">
          <img
            className="logo-fracassa-ok-323-page-0001-1"
            src="/mobile/logo-fracassa-new.png"
            alt="Fracassa Autolinee"
          />
        </div>

        <form className="frame-171" onSubmit={handleUserDataSubmit} noValidate>
          <div className="frame-170">
            <div className="frame-49">
              <input
                type="text"
                placeholder="Nome"
                value={userData.nome}
                onChange={(e) => {
                  setUserData({ ...userData, nome: e.target.value });
                  if (errorMessage) {
                    setErrorMessage(null);
                  }
                }}
                className="input-field"
                required
                aria-required="true"
              />
            </div>

            <div className="frame-492">
              <input
                type="text"
                placeholder="Cognome"
                value={userData.cognome}
                onChange={(e) => {
                  setUserData({ ...userData, cognome: e.target.value });
                  if (errorMessage) {
                    setErrorMessage(null);
                  }
                }}
                className="input-field"
                required
                aria-required="true"
              />
            </div>

            <div className="frame-84" ref={passeggeriDropdownRef}>
              <div className="frame-493">
                <div className="frame-213" onClick={() => setShowPasseggeriDropdown(!showPasseggeriDropdown)}>
                  <input
                    type="text"
                    placeholder="Passeggeri/e"
                    value={`${passeggeri} ${passeggeri === '1' ? 'passeggero' : 'passeggeri'}`}
                    readOnly
                    className="passeggeri-e"
                    aria-required="true"
                    aria-invalid={passeggeri.trim().length === 0}
                  />
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
            </div>

            <div className="frame-49">
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
                className="input-field"
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

          {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}

          <button 
            type="submit"
            className="frame-37"
            disabled={!isFormValid}
          >
            <div className="frame-17">
                <span className="continua">Continua</span>
            </div>
          </button>
        </form>
      </div>

      <style jsx>{`
        .buy {
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
          width: 335px;
          display: flex;
          flex-direction: column;
          gap: 42px;
          align-items: center;
          justify-content: flex-start;
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
        
        .frame-171 {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: center;
        }
        
        .frame-170 {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 17px;
          align-items: stretch;
        }
        
        .frame-49,
        .frame-492 {
          width: 100%;
          height: 45px;
          position: relative;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          background: #fffeff;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        }
        
        .frame-492 {
          display: flex;
        }
        
        .input-field {
          width: 100%;
          height: 100%;
          padding: 14px 16px;
          background: transparent;
          border: none;
          border-radius: 16px;
          color: rgba(151, 151, 164, 0.8);
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 500;
          outline: none;
        }
        
        .input-field::placeholder {
          color: rgba(151, 151, 164, 0.8);
        }
        
        .input-field:focus {
          color: rgba(151, 151, 164, 0.8);
        }
        
        .frame-84 {
          width: 159px;
          height: 45px;
          position: relative;
        }
        
        .frame-493 {
          width: 100%;
          height: 100%;
          position: relative;
        }
        
        .frame-213 {
          width: 100%;
          height: 100%;
          padding: 14px 40px 14px 16px;
          background: #fffeff;
          border: 1px solid rgba(0, 0, 0, 0.17);
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          position: relative;
        }
        
        .passeggeri-e {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: rgba(151, 151, 164, 0.8);
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 500;
          cursor: pointer;
        }
        
        .passeggeri-e::placeholder {
          color: rgba(151, 151, 164, 0.8);
        }
        
        .vector-5 {
          width: 12.5px;
          height: 8px;
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
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
          width: 109px;
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

        .frame-37:disabled {
          background: rgba(244, 148, 1, 0.5);
          cursor: not-allowed;
          filter: none;
          transform: none;
          box-shadow: none;
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
        
        .frame-17 {
          display: flex;
          flex-direction: row;
          gap: 1px;
          align-items: center;
          justify-content: flex-start;
        }
        
        .frame-35 {
          display: flex;
          align-items: center;
          justify-content: center;
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
