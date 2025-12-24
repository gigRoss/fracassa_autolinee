'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function GeneralPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="select-journey">
      {/* Top orange header with back arrow and close (white icons) */}
      <div className="header-bar">
        {/* Back button */}
        <button 
          className="back-button"
          onClick={handleBack}
          aria-label="Indietro"
        >
          <svg 
            width="18" 
            height="16" 
            viewBox="0 0 23 18" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M9.93086 17.1115C9.63081 17.4115 9.22392 17.58 8.79966 17.58C8.3754 17.58 7.9685 17.4115 7.66846 17.1115L0.468459 9.91154C0.168505 9.61149 7.322e-07 9.2046 7.69291e-07 8.78034C8.06381e-07 8.35608 0.168506 7.94918 0.468459 7.64914L7.66846 0.449139C7.97022 0.157687 8.37439 -0.00358318 8.7939 6.18039e-05C9.21342 0.00370678 9.61472 0.171977 9.91137 0.468631C10.208 0.765284 10.3763 1.16658 10.3799 1.5861C10.3836 2.00561 10.2223 2.40978 9.93086 2.71154L5.59966 7.18034L20.7997 7.18034C21.224 7.18034 21.631 7.34891 21.931 7.64897C22.2311 7.94903 22.3997 8.35599 22.3997 8.78034C22.3997 9.20469 22.2311 9.61165 21.931 9.91171C21.631 10.2118 21.224 10.3803 20.7997 10.3803L5.59966 10.3803L9.93086 14.8491C10.2308 15.1492 10.3993 15.5561 10.3993 15.9803C10.3993 16.4046 10.2308 16.8115 9.93086 17.1115Z" 
              fill="#FFFFFF"
            />
          </svg>
        </button>

        <div className="acquista">ADMIN</div>

        {/* Close button */}
        <button 
          className="close-button"
          onClick={handleClose}
          aria-label="Chiudi"
        >
          <Image 
            className="close-icon"
            src="/mobile/search/frame-580.svg"
            alt=""
            width={16}
            height={16}
          />
        </button>
      </div>

      {/* Menu section with buttons */}
      <div className="menu-section">
        <div className="frame-64">
          <button className="frame-49" onClick={() => router.push('/admin/driver/rides')}>
            <div className="corse">Biglietti</div>
          </button>
        </div>

        <div className="frame-62">
          <button className="frame-49" onClick={() => router.push('/admin/dashboard')}>
            <div className="corse">Corse</div>
          </button>
        </div>
      </div>

      <style jsx>{`
        .select-journey,
        .select-journey * {
          box-sizing: border-box;
        }

        .select-journey {
          background: #ffffff;
          height: 852px;
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 393px;
          margin: 0 auto;
        }

        .header-bar {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 91px;
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          background: linear-gradient(
            135deg,
            rgba(255, 169, 37, 1) 0%,
            rgba(250, 159, 19, 1) 57%,
            rgba(244, 148, 1, 1) 75%
          );
          z-index: 10;
        }

        .back-button {
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

        .back-button:hover {
          opacity: 0.8;
        }

        .back-button:active {
          transform: translateY(-50%) scale(0.95);
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

        .menu-section {
          position: absolute;
          left: 30px;
          top: 125px;
          width: 339px;
          display: flex;
          flex-direction: column;
          gap: 11px;
          z-index: 2;
        }

        .frame-64,
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
          background: #fffefe;
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 14px 20px;
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
          text-decoration: none;
          transition: background-color 0.2s ease, transform 0.2s ease;
          height: 45px;
          width: 100%;
        }

        .frame-49:hover {
          background: #F49401;
        }

        .frame-49:hover .corse {
          color: #ffffff;
        }

        .frame-49:active {
          background: #F49401;
          transform: scale(0.98);
        }

        .frame-49:active .corse {
          color: #ffffff;
        }

        .corse {
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          color: rgba(0, 0, 0, 0.8);
          transition: color 0.2s ease;
        }
      `}</style>
    </div>
  );
}

