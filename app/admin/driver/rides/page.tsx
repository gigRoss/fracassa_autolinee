'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { normalizeStopName, normalizeCity } from '@/app/lib/textUtils';

interface Stop {
  id: string;
  name: string;
  city: string;
}

interface Ride {
  id: string;
  lineName: string;
  originStopId: string;
  destinationStopId: string;
  departureTime: string;
  arrivalTime: string;
}

export default function DriverRidesPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ridesRes, stopsRes] = await Promise.all([
          fetch('/api/driver/rides', { cache: 'no-store' }),
          fetch('/api/stops', { cache: 'no-store' }),
        ]);

        if (ridesRes.ok) {
          const ridesData = await ridesRes.json();
          setRides(ridesData);
        }

        if (stopsRes.ok) {
          const stopsData = await stopsRes.json();
          setStops(stopsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const stopIdToStop = Object.fromEntries(stops.map((s) => [s.id, s] as const));

  const handleRideClick = (rideId: string) => {
    router.push(`/admin/driver/rides/${rideId}`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/admin/logout', { method: 'POST' });
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/admin/login';
    }
  };

  const getRideLabel = (ride: Ride): string => {
    const origin = stopIdToStop[ride.originStopId];
    const dest = stopIdToStop[ride.destinationStopId];
    
    if (!origin || !dest) return 'N/A';
    
    const originName = normalizeStopName(origin.name);
    const destName = normalizeStopName(dest.name);
    const originCity = normalizeCity(origin.city);
    const destCity = normalizeCity(dest.city);
    
    // Format: "OriginName - DestCity DestName" (like "Leofara - Teramo Centro")
    return `${originName} - ${destCity} ${destName}`;
  };

  return (
    <div className="select-journey">
      {/* Header bar with back and logout buttons */}
      <div className="header-bar">
        <div className="back-button" onClick={handleBack}>
          <Image
            src="/mobile/search/frame-410.svg"
            alt="Indietro"
            width={18}
            height={16}
            className="back-arrow"
          />
        </div>
        <div className="logout-button" onClick={handleLogout}>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
      </div>

      {/* Logo FRACASSA */}
      <div className="logo-container">
        <Image
          src="/mobile/logo-fracassa-new.png"
          alt="FRACASSA autolinee"
          width={112}
          height={80}
          className="logo-image"
          priority
        />
      </div>

      {/* Rides list */}
      <div className="rides-list-container">
        {loading ? (
          <div className="loading-message">Caricamento...</div>
        ) : rides.length === 0 ? (
          <div className="no-rides-message">Nessuna corsa con biglietti attivi</div>
        ) : (
          <div className="rides-list">
            {rides.map((ride) => (
              <button
                key={ride.id}
                className="ride-button"
                onClick={() => handleRideClick(ride.id)}
              >
                {getRideLabel(ride)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom line */}
      <div className="bottom-line" />

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
          width: 100%;
          height: 70px;
          position: absolute;
          left: 0;
          top: 0;
          background: linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%);
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 21px;
        }

        .back-button {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 8px;
        }

        .back-button:hover {
          opacity: 0.8;
        }

        .back-button:active {
          transform: scale(0.95);
        }

        .back-arrow {
          width: 18px;
          height: 16px;
        }

        .logout-button {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 8px;
        }

        .logout-button:hover {
          opacity: 0.8;
        }

        .logout-button:active {
          transform: scale(0.95);
        }

        .logo-container {
          position: absolute;
          left: 50%;
          top: 116px;
          transform: translateX(-50%);
          width: 112px;
          height: 80.144px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .rides-list-container {
          position: absolute;
          left: 26px;
          top: 243px;
          width: 339px;
          bottom: 60px;
          overflow-y: auto;
        }

        .rides-list-container::-webkit-scrollbar {
          display: none;
        }

        .rides-list-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .rides-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ride-button {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          padding: 14px 9px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: center;
          width: 100%;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          text-align: center;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #000000;
          position: relative;
        }

        .ride-button:hover {
          background: #F49401;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.3);
        }

        .ride-button:active {
          transform: translateY(0px) scale(0.98);
        }

        .loading-message,
        .no-rides-message {
          text-align: center;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.6);
          padding: 40px 20px;
        }

        .bottom-line {
          position: absolute;
          left: 152px;
          top: 844px;
          width: 90px;
          height: 0px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
