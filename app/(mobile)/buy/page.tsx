'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
      {/* Header Frame */}
      <div className="frame-244">
        <div className="frame-161">
          <div className="frame-back" onClick={handleBack}>
            <div className="back-arrow-wrapper">
              <Image
                src="/mobile/search/frame-410.svg"
                alt="Indietro"
                width={18}
                height={16}
                className="back-arrow"
              />
            </div>
          </div>
          <div className="acquista">ACQUISTA</div>
          <div className="close-button" onClick={() => router.push('/search')}>
            <Image
              src="/mobile/search/frame-580.svg"
              alt="Chiudi"
              width={16}
              height={16}
              className="close-icon"
            />
          </div>
        </div>
      </div>

      {/* Main Content Frame */}
      <div className="frame-192">
        {/* Logo Frame */}
        <div className="frame-185">
          <img
            className="logo-fracassa-ok-323-page-0001-1"
            src="/mobile/logo-fracassa-new.png"
            alt="Fracassa Autolinee"
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
        
        /* Header */
        .frame-244 {
          width: 100%;
          height: 91px;
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
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 21px;
        }
        
        .frame-back,
        .close-button {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .frame-back:hover,
        .close-button:hover {
          opacity: 0.8;
        }
        
        .frame-back:active,
        .close-button:active {
          transform: scale(0.95);
        }
        
        .back-arrow {
          width: 18px;
          height: 16px;
        }
        
        .back-arrow-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
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
          background: linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%);
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
          margin: 32px auto 0;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: filter 0.2s, transform 0.2s;
        }
        
        .frame-37:hover {
          filter: brightness(0.95);
        }
        
        .frame-37:active {
          transform: scale(0.97);
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
          flex-direction: row;
          gap: 8px;
          align-items: center;
          justify-content: center;
        }
        
        .continua {
          color: #ffffff;
          font-size: 14px;
          font-family: "Inter-Medium", sans-serif;
          font-weight: 600;
          text-transform: none;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
