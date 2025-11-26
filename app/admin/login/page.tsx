'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'autista' | 'amministrazione' | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    
    // Redirect to login form page for both roles
    router.push(`/admin/login-form?role=${selectedRole}`);
  };

  const handleClose = () => {
    router.push('/');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="admin-amministrazione">
      <img className="vector-3" src="/mobile/search/vector-30.svg" alt="" />
      
      <header className="frame-256">
        <div className="frame-161">
          <button className="frame-back" onClick={handleBack} aria-label="Torna indietro">
            <div className="back-arrow-wrapper">
              <Image className="back-arrow" src="/mobile/search/frame-410.svg" alt="" width={18} height={16} />
            </div>
          </button>
          <div className="acquista">ADMIN</div>
          <button className="close-button" onClick={handleClose} aria-label="Chiudi">
            <Image className="close-icon" src="/mobile/search/frame-580.svg" alt="" width={16} height={16} />
          </button>
        </div>
      </header>

      <div className="frame-156">
        <div className="frame-155">
          <div className="frame-62">
            <button
              type="button"
              className={`frame-49 ${selectedRole === 'autista' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('autista')}
            >
              <div className="autista">Autista</div>
            </button>
          </div>
          <div className="frame-45">
            <button
              type="button"
              className={`frame-492 ${selectedRole === 'amministrazione' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('amministrazione')}
            >
              <div className="amministrazione">Amministrazione</div>
            </button>
          </div>
        </div>
        <button 
          type="button" 
          className="frame-37" 
          onClick={handleContinue}
          disabled={!selectedRole}
        >
          <div className="avanti">Avanti</div>
        </button>
      </div>

      <style jsx>{`
        .admin-amministrazione,
        .admin-amministrazione * {
          box-sizing: border-box;
        }

        .admin-amministrazione {
          background: #ffffff;
          height: 852px;
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 393px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .vector-3 {
          width: 90px;
          height: 0px;
          position: absolute;
          left: 152px;
          top: 844px;
          overflow: visible;
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

        .frame-156 {
          display: flex;
          flex-direction: column;
          gap: 61px;
          align-items: center;
          justify-content: flex-start;
          width: 339px;
          position: absolute;
          left: 50%;
          top: 185px;
          transform: translateX(-50%);
        }

        .frame-155 {
          display: flex;
          flex-direction: column;
          gap: 11px;
          align-items: flex-start;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
        }

        .frame-62 {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          height: 45px;
          position: relative;
        }

        .frame-49 {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          padding: 14px 9px 14px 9px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: center;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          width: 100%;
          transition: background-color 0.2s;
        }

        .frame-49.selected {
          background: #f49401;
          border: 1px solid rgba(0, 0, 0, 0.17);
        }

        .frame-49.selected .autista {
          color: #ffffff;
        }

        .frame-49:not(.selected) {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.17);
        }

        .frame-49:not(.selected) .autista {
          color: rgba(0, 0, 0, 0.8);
        }

        .autista {
          color: rgba(0, 0, 0, 0.8);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          transition: color 0.2s;
        }

        .frame-45 {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          height: 45px;
          position: relative;
        }

        .frame-492 {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          padding: 14px 9px 14px 9px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: center;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          width: 100%;
          transition: background-color 0.2s;
        }

        .frame-492.selected {
          background: #f49401;
          border: 1px solid rgba(0, 0, 0, 0.17);
        }

        .frame-492.selected .amministrazione {
          color: #ffffff;
        }

        .frame-492:not(.selected) {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.17);
        }

        .frame-492:not(.selected) .amministrazione {
          color: rgba(0, 0, 0, 0.8);
        }

        .amministrazione {
          color: rgba(0, 0, 0, 0.8);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          transition: color 0.2s;
        }

        .frame-37 {
          background: #f49401;
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 15px 33px 15px 33px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          border: none;
          transition: background-color 0.2s, transform 0.2s;
        }

        .frame-37:hover:not(:disabled) {
          background: #e68501;
        }

        .frame-37:active:not(:disabled) {
          transform: scale(0.95);
        }

        .frame-37:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .avanti {
          color: #ffffff;
          text-align: left;
          font-family: "Inter-SemiBold", sans-serif;
          font-size: 14px;
          font-weight: 600;
          position: relative;
        }

      `}</style>
    </div>
  );
}
