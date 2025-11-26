'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatStopDisplay } from '@/app/lib/textUtils';

interface Ride {
  id: string;
  lineName: string;
  originStopId: string;
  destinationStopId: string;
  originStopName?: string;
  originStopCity?: string;
  destinationStopName?: string;
  destinationStopCity?: string;
  departureTime: string;
  arrivalTime: string;
}

export default function DriverRidesPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      // Fetch rides and stops
      const [ridesRes, stopsRes] = await Promise.all([
        fetch('/api/driver/rides'),
        fetch('/api/stops'),
      ]);

      if (!ridesRes.ok || !stopsRes.ok) {
        throw new Error('Errore nel caricamento dei dati');
      }

      const ridesData = await ridesRes.json();
      const stopsData = await stopsRes.json();

      // Create a map of stop IDs to stop data (name and city)
      const stopsMap = new Map<string, { name: string; city?: string }>();
      stopsData.forEach((stop: { id: string; name: string; city?: string }) => {
        stopsMap.set(stop.id, { name: stop.name, city: stop.city });
      });

      // Map rides with stop names and cities
      const ridesWithNames = ridesData.map((ride: Ride) => {
        const originStop = stopsMap.get(ride.originStopId);
        const destStop = stopsMap.get(ride.destinationStopId);
        return {
          ...ride,
          originStopName: originStop?.name || ride.originStopId,
          originStopCity: originStop?.city || '',
          destinationStopName: destStop?.name || ride.destinationStopId,
          destinationStopCity: destStop?.city || '',
        };
      });

      setRides(ridesWithNames);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento');
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push('/');
  };

  const handleBack = () => {
    router.back();
  };

  const handleRideClick = (rideId: string) => {
    setSelectedRideId(rideId);
    setTimeout(() => {
      router.push(`/admin/driver/rides/${rideId}`);
    }, 200);
  };


  if (loading) {
    return (
      <div className="select-journey">
        <div className="loading-container">
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="select-journey">
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate spacing between items (61px based on design)
  const itemSpacing = 61;
  // Vertical offset of first ride item inside the scroll container
  // (container itself is positioned under the header + logo)
  const startTop = 21;
  const itemLeft = 26;

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

        {/* Close button */}
        <button 
          className="close-button"
          onClick={handleClose}
          aria-label="Chiudi"
        >
          <svg 
            width="15" 
            height="15" 
            viewBox="0 0 15 15" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0.143677 0.143738L14.1437 14.1437" 
              stroke="#FFFFFF" 
              strokeWidth="3" 
              strokeLinecap="round"
            />
            <path 
              d="M13.9969 0L0.29042 14.2874" 
              stroke="#FFFFFF" 
              strokeWidth="3" 
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Logo wrapper (fixed under orange header, above rides) */}
      <div className="logo-wrapper">
        <img
          className="logo-fracassa-ok-323-page-0001-1"
          src="/mobile/logo-fracassa-new.png"
          alt="Fracassa Autolinee"
        />
      </div>

      {/* Scrollable container for ride items */}
      <div className="rides-container">
        {rides.map((ride, index) => {
          const rideText = `${formatStopDisplay(ride.originStopName, ride.originStopCity)} - ${formatStopDisplay(ride.destinationStopName, ride.destinationStopCity)}`;
          const isSelected = selectedRideId === ride.id;
          
          return (
            <div
              key={ride.id}
              className={`ride-item ${isSelected ? 'ride-item-selected' : ''}`}
              style={{
                left: `${itemLeft}px`,
                top: `${startTop + index * itemSpacing}px`,
              }}
              onClick={() => handleRideClick(ride.id)}
            >
              <p className="ride-item-text">{rideText}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom text */}
      {rides.length > 0 && (
        <p className="macchia-da-sole-teramo-centro">
          {formatStopDisplay(rides[0].originStopName, rides[0].originStopCity)} - {formatStopDisplay(rides[0].destinationStopName, rides[0].destinationStopCity)}
        </p>
      )}

      {/* Vector 3 */}
      <div className="vector-3">
        <img src="/mobile/search/vector-30.svg" alt="" />
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
          padding: 16px 23px 20px;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          background: linear-gradient(
            135deg,
            rgba(255, 169, 37, 1) 0%,
            rgba(250, 159, 19, 1) 57%,
            rgba(244, 148, 1, 1) 75%
          );
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 10;
        }

        .back-button,
        .close-button {
          width: auto;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .back-button:hover,
        .close-button:hover {
          opacity: 0.8;
        }

        .back-button:active,
        .close-button:active {
          transform: scale(0.95);
        }

        .rides-container {
          position: absolute;
          left: 0;
          right: 0;
          top: 260px; /* visual start of list under logo block */
          bottom: 0;
          padding-bottom: 100px;
          overflow-y: auto;
          overflow-x: hidden;
          z-index: 1;
          background: #ffffff;
        }

        .rides-container::-webkit-scrollbar {
          display: none;
        }

        .rides-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .logo-wrapper {
          position: absolute;
          left: 0;
          right: 0;
          top: 130px;
          display: flex;
          justify-content: center;
          padding: 16px 0;
          background: #ffffff;
          z-index: 8; /* above rides, below header */
        }

        .logo-fracassa-ok-323-page-0001-1 {
          width: 112px;
          height: 80.14px;
          object-fit: cover;
          aspect-ratio: 112/80.14;
        }

        .macchia-da-sole-teramo-centro {
          color: #000000;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: absolute;
          left: 86px;
          top: 865.5px;
        }

        .vector-3 {
          width: 90px;
          height: 0px;
          position: absolute;
          left: 152px;
          top: 844px;
          overflow: visible;
        }

        .vector-3 img {
          width: 100%;
          height: auto;
          display: block;
        }

        .ride-item {
          background: #ffffff;
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 14px 9px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: center;
          width: 339px;
          position: absolute;
          cursor: pointer;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          transition: all 0.2s ease;
        }

        .ride-item:hover {
          background: #F49401;
          border-color: #F49401;
        }

        .ride-item:hover .ride-item-text {
          color: #000000;
        }

        .ride-item:active {
          transform: scale(0.98);
        }

        .ride-item.ride-item-selected {
          background: #F49401 !important;
          border-color: #F49401 !important;
        }

        .ride-item.ride-item-selected .ride-item-text {
          color: #000000 !important;
        }

        .ride-item.ride-item-selected:active {
          transform: scale(0.98);
        }

        .ride-item.ride-item-selected:hover {
          background: #F49401 !important;
          border-color: #F49401 !important;
        }

        .ride-item.ride-item-selected:hover .ride-item-text {
          color: #000000 !important;
        }

        .ride-item-text {
          color: #000000;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .loading-container,
        .error-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .error-message {
          color: #d32f2f;
          font-size: 14px;
          font-family: Inter, sans-serif;
        }
      `}</style>
    </div>
  );
}
