'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin2Page() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'autista' | 'amministrazione'>('amministrazione');

  const handleContinue = () => {
    if (selectedRole === 'amministrazione') {
      router.push('/admin/login');
    } else {
      // TODO: Implementare la pagina di login per autista
      router.push('/admin/login'); // Per ora reindirizza allo stesso login
    }
  };

  return (
    <div className="admin-amministrazione">
      <img className="vector-3" src="/mobile/search/vector-30.svg" alt="" />
      
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
        <button type="button" className="frame-37" onClick={handleContinue}>
          <div className="avanti">Avanti</div>
        </button>
      </div>

      <div className="frame-258">
        <Image className="vector" src="/mobile/search/frame-410.svg" alt="" width={18} height={14} />
        <Image className="frame-252" src="/mobile/search/frame-580.svg" alt="" width={16} height={16} />
      </div>

      <div className="frame-257">
        <div className="admin">ADMIN</div>
      </div>

      <div className="frame-161"></div>

      <div className="frame-260">
        <div className="admin2">ADMIN</div>
      </div>

      <div className="frame-253">
        <Image className="vector3" src="/mobile/search/frame-410.svg" alt="" width={20} height={16} />
        <Image className="frame-2523" src="/mobile/search/frame-580.svg" alt="" width={16} height={16} />
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
        }

        .vector-3 {
          width: 90px;
          height: 0px;
          position: absolute;
          left: 152px;
          top: 844px;
          overflow: visible;
        }

        .frame-156 {
          display: flex;
          flex-direction: column;
          gap: 61px;
          align-items: center;
          justify-content: flex-start;
          width: 339px;
          position: absolute;
          left: 30px;
          top: 185px;
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
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
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
          border: none;
          width: 100%;
          transition: background-color 0.2s;
        }

        .frame-49.selected {
          background: #f49401;
        }

        .frame-49.selected .autista {
          color: #ffffff;
        }

        .frame-49:not(.selected) {
          background: #ffffff;
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
          background: #f49401;
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
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
          border: none;
          width: 100%;
          transition: background-color 0.2s;
        }

        .frame-492.selected {
          background: #f49401;
        }

        .frame-492.selected .amministrazione {
          color: #ffffff;
        }

        .frame-492:not(.selected) {
          background: #ffffff;
        }

        .frame-492:not(.selected) .amministrazione {
          color: rgba(0, 0, 0, 0.8);
        }

        .amministrazione {
          color: #ffffff;
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

        .frame-37:hover {
          background: #e68501;
        }

        .frame-37:active {
          transform: scale(0.95);
        }

        .avanti {
          color: #ffffff;
          text-align: left;
          font-family: "Inter-SemiBold", sans-serif;
          font-size: 14px;
          font-weight: 600;
          position: relative;
        }

        .frame-258 {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 348px;
          position: absolute;
          left: 21px;
          top: 60px;
          opacity: 0;
          pointer-events: none;
        }

        .vector {
          flex-shrink: 0;
          width: 18px;
          height: 14px;
          position: relative;
          overflow: visible;
        }

        .frame-252 {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          position: relative;
          overflow: visible;
        }

        .frame-254 {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 348px;
          position: absolute;
          left: 21px;
          top: 60px;
          opacity: 0;
          pointer-events: none;
        }

        .vector2 {
          flex-shrink: 0;
          width: 18px;
          height: 14px;
          position: relative;
          overflow: visible;
        }

        .frame-2522 {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          position: relative;
          overflow: visible;
        }

        .frame-257 {
          width: 243px;
          height: 24px;
          position: absolute;
          left: 75px;
          top: 48px;
          opacity: 0;
          pointer-events: none;
        }

        .admin {
          color: #ffffff;
          text-align: center;
          font-family: "Inter-Regular", sans-serif;
          font-size: 20px;
          font-weight: 400;
          position: absolute;
          left: calc(50% - 46.5px);
          top: 0px;
          width: 67px;
        }

        .frame-161 {
          background: radial-gradient(
            closest-side,
            rgba(255, 169, 37, 1) 39.13757801055908%,
            rgba(244, 148, 1, 1) 74.92230534553528%
          );
          border-radius: 0px 0px 20px 20px;
          padding: 0px 124px 0px 124px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          justify-content: flex-start;
          width: 394px;
          height: 83px;
          position: absolute;
          left: 0px;
          top: 0px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        }

        .frame-260 {
          width: 64px;
          height: 24px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 56px;
        }

        .admin2 {
          color: #ffffff;
          text-align: center;
          font-family: "Inter-Regular", sans-serif;
          font-size: 20px;
          font-weight: 400;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 0px;
          width: 67px;
        }

        .frame-253 {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 348px;
          position: absolute;
          left: 23px;
          top: 52px;
          opacity: 0;
          pointer-events: none;
        }

        .vector3 {
          flex-shrink: 0;
          width: 20px;
          height: 16px;
          position: relative;
          overflow: visible;
        }

        .frame-2523 {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          position: relative;
          overflow: visible;
        }
      `}</style>
    </div>
  );
}

