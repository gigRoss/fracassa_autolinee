'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/app/components/mobile/InputField';
import BottomNav from '@/app/components/mobile/BottomNav';

export default function BuyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    passeggeri: '',
    email: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.nome.trim()) {
      alert('Inserisci il nome');
      return;
    }
    if (!formData.cognome.trim()) {
      alert('Inserisci il cognome');
      return;
    }
    if (!formData.email.trim()) {
      alert('Inserisci l\'email');
      return;
    }
    if (!formData.passeggeri.trim()) {
      alert('Inserisci il numero di passeggeri');
      return;
    }
    
    // Handle form submission logic here
    console.log('Form submitted:', formData);
    // TODO: Process payment and redirect to confirmation
    alert('Form inviato con successo! (Demo)');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="buy">
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
          <form onSubmit={handleSubmit} className="frame-170">
            {/* Nome Field */}
            <div className="frame-49">
              <input
                type="text"
                placeholder="Nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="nome"
              />
            </div>
            
            {/* Cognome Field */}
            <div className="frame-492">
              <input
                type="text"
                placeholder="Cognome"
                value={formData.cognome}
                onChange={(e) => handleInputChange('cognome', e.target.value)}
                className="cognome"
              />
            </div>
            
            {/* Passeggeri Field */}
            <div className="frame-84">
              <div className="frame-493">
                <div className="frame-213">
                  <input
                    type="text"
                    placeholder="Passeggeri/e"
                    value={formData.passeggeri}
                    onChange={(e) => handleInputChange('passeggeri', e.target.value)}
                    className="passeggeri-e"
                  />
                  <div className="vector-5"></div>
                </div>
              </div>
            </div>
            
            {/* Email Field */}
            <div className="frame-49">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="email"
              />
            </div>

            {/* Continue Button */}
            <div className="frame-37">
              <button type="submit" className="frame-17">
                <div className="frame-35">
                  <div className="continua">Continua</div>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Header Frame */}
      <div className="frame-244">
        <div className="frame-161">
          <div className="frame-235">
            <div className="acquista">Acquista</div>
          </div>
        </div>
      </div>
      
      {/* Status Bar Frame */}
      <div className="frame-234">
        <button onClick={handleBack} className="back-button">
          <div className="vector"></div>
        </button>
        <div className="frame-251">
          <div className="frame-251-inner-1"></div>
          <div className="frame-251-inner-2"></div>
        </div>
        <div className="frame-232">
          <div className="_9-41">9:41</div>
          <div className="frame-231">
            <div className="frame-225">
              <div className="rectangle-3"></div>
              <div className="rectangle-4"></div>
              <div className="rectangle-5"></div>
              <div className="rectangle-6"></div>
            </div>
            <div className="frame-229">
              <div className="frame-227"></div>
            </div>
            <div className="frame-230">
              <div className="rectangle-2"></div>
              <div className="ellipse-1"></div>
              <div className="rectangle-1"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

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
        
        .frame-192 {
          width: calc(100% - 58px);
          left: 29px;
          top: 125px;
          position: absolute;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          gap: 42px;
          display: inline-flex;
        }
        
        .frame-185 {
          width: 184px;
          padding: 10px;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          gap: 10px;
          display: inline-flex;
        }
        
        .logo-fracassa-ok-323-page-0001-1 {
          align-self: stretch;
          height: 117px;
          object-fit: cover;
        }
        
        .frame-171 {
          align-self: stretch;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          gap: 32px;
          display: inline-flex;
        }
        
        .frame-170 {
          align-self: stretch;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
          gap: 17px;
          display: flex;
        }
        
        .frame-49 {
          align-self: stretch;
          height: 56px;
          padding: 0 16px;
          background: #FFFEFE;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
          border-radius: 16px;
          outline: 1px rgba(0, 0, 0, 0.10) solid;
          outline-offset: -1px;
          justify-content: center;
          align-items: center;
          gap: 10px;
          display: inline-flex;
        }
        
        .nome {
          background: transparent;
          border: none;
          outline: none;
          color: rgba(151, 151, 164, 0.80);
          font-size: 14px;
          font-family: Inter;
          font-weight: 500;
          word-wrap: break-word;
          width: 100%;
        }
        
        .nome::placeholder {
          color: rgba(151, 151, 164, 0.80);
        }
        
        .frame-492 {
          align-self: stretch;
          height: 56px;
          padding: 0 16px;
          background: #FFFEFE;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
          border-radius: 16px;
          outline: 1px rgba(0, 0, 0, 0.10) solid;
          outline-offset: -1px;
          justify-content: center;
          align-items: center;
          gap: 10px;
          display: inline-flex;
        }
        
        .cognome {
          background: transparent;
          border: none;
          outline: none;
          color: rgba(151, 151, 164, 0.80);
          font-size: 14px;
          font-family: Inter;
          font-weight: 500;
          word-wrap: break-word;
          width: 100%;
        }
        
        .cognome::placeholder {
          color: rgba(151, 151, 164, 0.80);
        }
        
        .frame-84 {
          width: 70%;
          min-width: 240px;
          height: 56px;
          position: relative;
        }
        
        .frame-493 {
          width: 100%;
          height: 56px;
          padding: 0 16px;
          left: 0px;
          top: 0px;
          position: absolute;
          background: #FFFEFE;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
          border-radius: 16px;
          outline: 1px rgba(0, 0, 0, 0.10) solid;
          outline-offset: -1px;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          display: inline-flex;
        }
        
        .frame-213 {
          justify-content: flex-start;
          align-items: center;
          gap: 10px;
          display: flex;
        }
        
        .passeggeri-e {
          background: transparent;
          border: none;
          outline: none;
          color: rgba(151, 151, 164, 0.80);
          font-size: 14px;
          font-family: Inter;
          font-weight: 500;
          word-wrap: break-word;
          width: 100%;
        }
        
        .passeggeri-e::placeholder {
          color: rgba(151, 151, 164, 0.80);
        }
        
        .vector-5 {
          width: 12.50px;
          height: 8px;
          outline: 1px #ACACB6 solid;
          outline-offset: -0.50px;
          position: relative;
        }
        
        .vector-5::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          border-left: 3px solid transparent;
          border-right: 3px solid transparent;
          border-top: 4px solid #ACACB6;
        }
        
        .email {
          background: transparent;
          border: none;
          outline: none;
          color: rgba(151, 151, 164, 0.80);
          font-size: 14px;
          font-family: Inter;
          font-weight: 500;
          word-wrap: break-word;
          width: 100%;
        }
        
        .email::placeholder {
          color: rgba(151, 151, 164, 0.80);
        }
        
        .frame-37 {
          width: 210px;
          margin: 8px auto 0;
          padding-left: 27px;
          padding-right: 27px;
          padding-top: 15px;
          padding-bottom: 15px;
          background: #F49401;
          box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.25);
          border-radius: 16px;
          outline: 1px rgba(0, 0, 0, 0.17) solid;
          outline-offset: -1px;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 10px;
          display: flex;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .frame-37:hover {
          background: #e68501;
        }
        
        .frame-17 {
          justify-content: flex-start;
          align-items: center;
          gap: 1px;
          display: inline-flex;
          background: none;
          border: none;
          padding: 0;
          width: 100%;
          height: 100%;
        }
        
        .frame-35 {
          width: 55px;
          height: 17px;
          position: relative;
        }
        
        .continua {
          left: -3px;
          top: 0px;
          position: absolute;
          color: white;
          font-size: 14px;
          font-family: Inter;
          font-weight: 600;
          word-wrap: break-word;
        }
        
        .frame-244 {
          width: 100%;
          height: 91px;
          padding-left: 21px;
          padding-right: 21px;
          padding-top: 16px;
          padding-bottom: 16px;
          left: 0px;
          top: -5px;
          position: absolute;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          gap: 10px;
          display: inline-flex;
        }
        
        .frame-161 {
          width: 100%;
          height: 91px;
          left: 0px;
          top: 0px;
          position: absolute;
          background: linear-gradient(to bottom right, #FFA925 20%, #F49401 37%) bottom right / 50% 50% no-repeat, linear-gradient(to bottom left, #FFA925 20%, #F49401 37%) bottom left / 50% 50% no-repeat, linear-gradient(to top left, #FFA925 20%, #F49401 37%) top left / 50% 50% no-repeat, linear-gradient(to top right, #FFA925 20%, #F49401 37%) top right / 50% 50% no-repeat;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
        }
        
        .frame-235 {
          padding: 10px;
          left: 124px;
          top: 42px;
          position: absolute;
          justify-content: center;
          align-items: center;
          gap: 10px;
          display: inline-flex;
        }
        
        .acquista {
          color: #FFF9F9;
          font-size: 24px;
          font-family: Inter;
          font-weight: 700;
          text-transform: uppercase;
          word-wrap: break-word;
        }
        
        .frame-234 {
          width: 350.17px;
          height: 57px;
          left: 21px;
          top: 18px;
          position: absolute;
        }
        
        .back-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        
        .vector {
          width: 18px;
          height: 14px;
          left: 18px;
          top: 57px;
          position: absolute;
          transform: rotate(-180deg);
          transform-origin: top left;
          background: white;
        }
        
        .frame-251 {
          width: 12.14px;
          height: 12.14px;
          left: 337px;
          top: 43.93px;
          position: absolute;
        }
        
        .frame-251-inner-1 {
          width: 11.90px;
          height: 11.90px;
          left: 11.90px;
          top: 0px;
          position: absolute;
          transform: rotate(89deg);
          transform-origin: top left;
          outline: 3px white solid;
          outline-offset: -1.50px;
        }
        
        .frame-251-inner-2 {
          width: 12px;
          height: 12px;
          left: 0px;
          top: 0.07px;
          position: absolute;
          outline: 3px white solid;
          outline-offset: -1.50px;
        }
        
        .frame-232 {
          width: 321.03px;
          left: 29.14px;
          top: 0px;
          position: absolute;
          justify-content: space-between;
          align-items: center;
          display: inline-flex;
        }
        
        ._9-41 {
          width: 33px;
          height: 18px;
          color: black;
          font-size: 16px;
          font-family: Inter;
          font-weight: 500;
          word-wrap: break-word;
        }
        
        .frame-231 {
          justify-content: flex-start;
          align-items: flex-start;
          gap: 7px;
          display: flex;
        }
        
        .frame-225 {
          justify-content: flex-start;
          align-items: flex-end;
          gap: 2px;
          display: flex;
        }
        
        .rectangle-3 {
          width: 3.57px;
          height: 5.66px;
          background: black;
          border-radius: 11px;
        }
        
        .rectangle-4 {
          width: 3.57px;
          height: 7.79px;
          background: black;
          border-radius: 11px;
        }
        
        .rectangle-5 {
          width: 3.57px;
          height: 10.15px;
          background: black;
          border-radius: 11px;
        }
        
        .rectangle-6 {
          width: 3.57px;
          height: 12.45px;
          background: black;
          border-radius: 11px;
        }
        
        .frame-229 {
          width: 17px;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          gap: 10px;
          display: inline-flex;
        }
        
        .frame-227 {
          align-self: stretch;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          gap: 10px;
          display: flex;
        }
        
        .frame-227::before {
          content: '';
          width: 17px;
          height: 13px;
          background: black;
        }
        
        .frame-230 {
          width: 30px;
          position: relative;
          justify-content: flex-start;
          align-items: center;
          display: flex;
        }
        
        .rectangle-2 {
          width: 25.87px;
          height: 14px;
          background: black;
          border-radius: 30px;
        }
        
        .ellipse-1 {
          width: 4.37px;
          height: 5.29px;
          background: black;
          border-radius: 9999px;
        }
        
        .rectangle-1 {
          width: 24.54px;
          height: 12.39px;
          left: 0.72px;
          top: 0.87px;
          position: absolute;
          background: black;
          border-radius: 30px;
          border: 1px white solid;
        }
      `}</style>
    </div>
  );
}
