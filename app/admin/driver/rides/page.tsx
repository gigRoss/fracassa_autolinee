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
  slug: string;
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
          fetch('/rides', { cache: 'no-store' }),
          fetch('/stops', { cache: 'no-store' }),
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
          <div className="no-rides-message">Nessuna corsa presente</div>
        ) : (
          <div className="rides-list">
            {rides.map((ride) => (
              <button
                key={ride.slug}
                className="ride-button"
                onClick={() => handleRideClick(ride.slug)}
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
