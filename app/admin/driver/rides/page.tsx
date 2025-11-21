'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Ride {
  id: string;
  lineName: string;
  originStopId: string;
  destinationStopId: string;
  originStopName?: string;
  destinationStopName?: string;
  departureTime: string;
  arrivalTime: string;
}

export default function DriverRidesPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Create a map of stop IDs to names
      const stopsMap = new Map<string, string>();
      stopsData.forEach((stop: { id: string; name: string }) => {
        stopsMap.set(stop.id, stop.name);
      });

      // Map rides with stop names
      const ridesWithNames = ridesData.map((ride: Ride) => ({
        ...ride,
        originStopName: stopsMap.get(ride.originStopId) || ride.originStopId,
        destinationStopName: stopsMap.get(ride.destinationStopId) || ride.destinationStopId,
      }));

      setRides(ridesWithNames);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento');
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleClose = () => {
    router.push('/');
  };

  const handleRideClick = (rideId: string) => {
    // TODO: Navigate to ride details page
    router.push(`/admin/driver/rides/${rideId}`);
  };

  const formatStopName = (name: string): string => {
    // Take only the first part before comma if present, and format with first letter uppercase
    const firstPart = name.split(',')[0].trim();
    return firstPart.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
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

  return (
    <div className="select-journey">
      <div className="frame-242">
        <div className="frame-185">
          <img
            className="logo-fracassa-ok-323-page-0001-1"
            src="/mobile/logo-fracassa-new.png"
            alt="Fracassa Autolinee"
          />
        </div>

        <div className="frame-90">
          <div className="frame-79">
            {rides.map((ride, index) => {
              const rideText = `${formatStopName(ride.originStopName || ride.originStopId)} - ${formatStopName(ride.destinationStopName || ride.destinationStopId)}`;
              
              // First ride: frame-63 with padding 52px 84px and subtract0.svg
              if (index === 0) {
                return (
                  <div
                    key={ride.id}
                    className="frame-63"
                    onClick={() => handleRideClick(ride.id)}
                  >
                    <div className="subtract-container">
                      <img 
                        className="subtract" 
                        src="/mobile/search/subtract0.svg" 
                        alt="" 
                      />
                    </div>
                    <p className="ride-name">
                      {rideText}
                    </p>
                  </div>
                );
              }
              
              // Second and third rides: frame-64, frame-65 with padding 52px 76px and subtract1.svg
              if (index === 1 || index === 2) {
                const className = index === 1 ? 'frame-64' : 'frame-65';
                return (
                  <div
                    key={ride.id}
                    className={className}
                    onClick={() => handleRideClick(ride.id)}
                  >
                    <div className="subtract-container">
                      <img 
                        className="subtract" 
                        src="/mobile/search/subtract1.svg" 
                        alt="" 
                      />
                    </div>
                    <p className="ride-name">
                      {rideText}
                    </p>
                  </div>
                );
              }
              
              // 4th ride (index 3): frame-73 with frame-66 inside
              if (index === 3) {
                return (
                  <div key={ride.id} className="frame-73">
                    <div className="frame-66" onClick={() => handleRideClick(ride.id)}>
                      <div className="subtract-container">
                        <img 
                          className="subtract" 
                          src="http://localhost:3845/assets/b6f2c234d9788c2a461f104b47db8ae40abd2ad2.svg" 
                          alt="" 
                        />
                      </div>
                      <p className="ride-name">
                        {rideText}
                      </p>
                    </div>
                  </div>
                );
              }
              
              // 5th ride (index 4): frame-74 with frame-662 inside
              if (index === 4) {
                return (
                  <div key={ride.id} className="frame-74">
                    <div className="frame-662" onClick={() => handleRideClick(ride.id)}>
                      <div className="subtract-container">
                        <img 
                          className="subtract" 
                          src="http://localhost:3845/assets/b6f2c234d9788c2a461f104b47db8ae40abd2ad2.svg" 
                          alt="" 
                        />
                      </div>
                      <p className="ride-name">
                        {rideText}
                      </p>
                    </div>
                  </div>
                );
              }
              
              // More than 5 rides: use frame-73 structure
              return (
                <div key={ride.id} className="frame-73">
                  <div className="frame-66" onClick={() => handleRideClick(ride.id)}>
                    <div className="subtract-container">
                      <img 
                        className="subtract" 
                        src="/mobile/search/subtract1.svg" 
                        alt="" 
                      />
                    </div>
                    <p className="ride-name">
                      {rideText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="vector-3">
        <img src="/mobile/search/vector-30.svg" alt="" />
      </div>
      <div className="vector-4">
        <img src="/mobile/search/vector-40.svg" alt="" />
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

        .vector-4 {
          width: 0px;
          height: 147px;
          position: absolute;
          left: 382px;
          top: 281px;
          overflow: visible;
        }

        .vector-4 img {
          width: auto;
          height: 100%;
          display: block;
        }

        .frame-242 {
          display: flex;
          flex-direction: column;
          gap: 17px;
          align-items: center;
          justify-content: flex-start;
          width: 374px;
          position: absolute;
          left: 10px;
          top: 106px;
        }

        .frame-185 {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          justify-content: flex-start;
          flex-shrink: 0;
          width: 132px;
          height: 98px;
          position: relative;
        }

        .logo-fracassa-ok-323-page-0001-1 {
          align-self: stretch;
          flex-shrink: 0;
          height: 80.14px;
          position: relative;
          object-fit: cover;
          aspect-ratio: 112/80.14;
        }

        .frame-90 {
          padding: 10px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
        }

        .frame-79 {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          width: 354px;
          position: relative;
        }

        .frame-63 {
          padding: 52px 84px 52px 84px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          width: 334px;
          height: 122px;
          position: relative;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .frame-64 {
          padding: 52px 76px 52px 76px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          width: 334px;
          height: 122px;
          position: relative;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .frame-65 {
          padding: 52px 76px 52px 76px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          width: 334px;
          height: 122px;
          position: relative;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .frame-73 {
          padding: 10px;
          align-self: stretch;
          flex-shrink: 0;
          height: 142px;
          position: relative;
        }

        .frame-66 {
          padding: 52px 84px 52px 84px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 334px;
          height: 122px;
          position: absolute;
          left: 10px;
          top: 10px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .frame-74 {
          padding: 10px;
          align-self: stretch;
          flex-shrink: 0;
          height: 142px;
          position: relative;
        }

        .frame-662 {
          padding: 52px 56px 52px 56px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 334px;
          height: 122px;
          position: absolute;
          left: 10px;
          top: 10px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .frame-63:hover,
        .frame-64:hover,
        .frame-65:hover,
        .frame-66:hover,
        .frame-662:hover {
          opacity: 0.8;
        }

        .subtract-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 334px;
          height: 122px;
          overflow: visible;
          pointer-events: none;
        }

        .subtract {
          position: absolute;
          bottom: -6.56%;
          left: -1.2%;
          right: -1.2%;
          top: 0;
          width: 100%;
          height: 100%;
          object-fit: fill;
          display: block;
          max-width: none;
        }

        .ride-name {
          color: #000000;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          z-index: 1;
          white-space: nowrap;
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

