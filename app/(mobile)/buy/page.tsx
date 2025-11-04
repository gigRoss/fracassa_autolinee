'use client';

import { useState } from 'react';
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

  const passeggeriOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  const handleUserDataSubmit = () => {
    // Handle form submission logic here
    const completeFormData = {
      ...userData,
      passeggeri: passeggeri,
    };
    console.log('Form submitted:', completeFormData);
    // TODO: Process payment and redirect to confirmation
    router.push('/buy/payment'); // o la pagina successiva appropriata
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="buy">
      {/* Status Bar Frame */}
      <div className="frame-234">
        <button onClick={handleBack} className="back-button">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="vector-back">
            <path d="M1 7L17 7M1 7L7 1M1 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="frame-252">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="white" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>

      {/* Header Frame */}
      <div className="frame-244">
        <div className="frame-161">
          <div className="acquista">ACQUISTA</div>
        </div>
      </div>

      {/* Main Content Frame */}
      <div className="frame-192">
        {/* Logo Frame */}
        <div className="frame-185">
          <img
            className="logo-fracassa-ok-323-page-0001-1"
            src="/mobile/splash-logo.png"
            alt="Fracassa Logo"
          />
        </div>
        
        {/* Form Frame */}
        <div className="frame-171">
          <div className="frame-170">
            {/* Nome Field */}
            <div className="frame-49">
              <input
                type="text"
                placeholder="Nome"
                value={userData.nome}
                onChange={(e) => setUserData({ ...userData, nome: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Cognome Field */}
            <div className="frame-49">
              <input
                type="text"
                placeholder="Cognome"
                value={userData.cognome}
                onChange={(e) => setUserData({ ...userData, cognome: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Passeggeri/e Field - Dropdown */}
            <div className="frame-84">
              <div className="frame-493">
                <div className="frame-213" onClick={() => setShowPasseggeriDropdown(!showPasseggeriDropdown)}>
                  <input
                    type="text"
                    placeholder="Passeggeri/e"
                    value={`${passeggeri} ${passeggeri === '1' ? 'passeggero' : 'passeggeri'}`}
                    readOnly
                    className="passeggeri-e"
                  />
                  <div className="vector-5">
                    <svg width="12.5" height="8" viewBox="0 0 12.5 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6.25 6L11.5 1" stroke="#ACACB6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
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
                        }}
                      >
                        {option} {option === '1' ? 'passeggero' : 'passeggeri'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="frame-49">
              <input
                type="email"
                placeholder="Email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Continue Button */}
          <button 
            onClick={handleUserDataSubmit}
            className="frame-37"
          >
            <div className="frame-17">
              <div className="frame-35">
                <span className="continua">Continua</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <style jsx>{`
        .buy {
          width: 100%;
          max-width: 393px;
          min-height: 100dvh;
          position: relative;
          background: white;
          overflow: hidden;
          margin: 0 auto;
        }
        
        /* Status Bar */
        .frame-234 {
          width: 350.17px;
          height: 57px;
          left: 21px;
          top: 18px;
          position: absolute;
          z-index: 10;
        }
        
        .back-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          position: absolute;
          left: 0;
          top: 33px;
          width: 18px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .vector-back {
          transform: rotate(180deg);
        }
        
        .frame-252 {
          width: 16px;
          height: 16px;
          position: absolute;
          right: 0;
          top: 33px;
        }
        
        /* Header */
        .frame-244 {
          width: 100%;
          height: 86px;
          left: 0px;
          top: 0px;
          position: absolute;
          z-index: 5;
        }
        
        .frame-161 {
          width: 100%;
          height: 100%;
          position: relative;
          background: linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%);
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
        }
        
        .acquista {
          position: absolute;
          left: 50%;
          top: 48px;
          transform: translateX(-50%);
          color: white;
          font-size: 20px;
          font-family: Inter, sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Main Content */
        .frame-192 {
          width: calc(100% - 58px);
          left: 29px;
          top: 125px;
          position: absolute;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          gap: 42px;
        }
        
        .frame-185 {
          width: 184px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          gap: 10px;
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
          justify-content: flex-start;
          align-items: center;
          gap: 32px;
        }
        
        .frame-170 {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
          gap: 17px;
        }
        
        .frame-49 {
          width: 100%;
          height: 45px;
          position: relative;
        }
        
        .input-field {
          width: 100%;
          height: 100%;
          padding: 14px 16px;
          background: #FFFEFE;
          border: 1px solid rgba(0, 0, 0, 0.17);
          border-radius: 16px;
          color: rgba(151, 151, 164, 0.80);
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 500;
          outline: none;
        }
        
        .input-field::placeholder {
          color: rgba(151, 151, 164, 0.80);
        }
        
        .input-field:focus {
          border-color: #F49401;
        }
        
        /* Passeggeri Dropdown */
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
          padding: 14px 16px;
          background: #FFFEFE;
          border: 1px solid rgba(0, 0, 0, 0.17);
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        
        .passeggeri-e {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: rgba(151, 151, 164, 0.80);
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 500;
          cursor: pointer;
        }
        
        .passeggeri-e::placeholder {
          color: rgba(151, 151, 164, 0.80);
        }
        
        .vector-5 {
          width: 12.5px;
          height: 8px;
          flex-shrink: 0;
        }
        
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.17);
          border-radius: 16px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
          z-index: 20;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .dropdown-item {
          padding: 12px 16px;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 500;
          color: rgba(151, 151, 164, 0.80);
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .dropdown-item:hover {
          background-color: rgba(244, 148, 1, 0.1);
        }
        
        .dropdown-item:first-child {
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }
        
        .dropdown-item:last-child {
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
        }
        
        /* Continue Button */
        .frame-37 {
          width: 109px;
          height: 47px;
          padding: 15px 27px;
          background: #F49401;
          border: 1px solid rgba(0, 0, 0, 0.17);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: background-color 0.2s;
          box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.25);
        }
        
        .frame-37:hover {
          background: #e68501;
        }
        
        .frame-37:active {
          transform: scale(0.98);
        }
        
        .frame-17 {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 1px;
        }
        
        .frame-35 {
          width: 55px;
          height: 17px;
          position: relative;
        }
        
        .continua {
          color: white;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 600;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
