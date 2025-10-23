'use client';

import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { stops, stopIdToStop, formatDuration } from '../../lib/data';
import type { Stop } from '../../lib/data';

/**
 * Search Results Content Component - Contains the main logic that uses useSearchParams
 */
function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get search parameters from URL
  const fromStopId = searchParams.get('from');
  const toStopId = searchParams.get('to');
  const andataDate = searchParams.get('andata');
  const ritornoDate = searchParams.get('ritorno');
  
  // State for selected stops
  const [fromStop, setFromStop] = useState<Stop | null>(null);
  const [toStop, setToStop] = useState<Stop | null>(null);
  
  // State for ride data
  const [availableRides, setAvailableRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize stops from URL params and fetch ride data
  useEffect(() => {
    if (fromStopId && stopIdToStop[fromStopId]) {
      setFromStop(stopIdToStop[fromStopId]);
    }
    if (toStopId && stopIdToStop[toStopId]) {
      setToStop(stopIdToStop[toStopId]);
    }

    // Fetch ride data if we have both stops
    if (fromStopId && toStopId) {
      fetchRideData(fromStopId, toStopId);
    } else {
      setLoading(false);
    }
  }, [fromStopId, toStopId]);

  // Fetch ride data from API
  const fetchRideData = async (origin: string, destination: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ride data');
      }
      
      const data = await response.json();
      setAvailableRides(data.results || []);
    } catch (err) {
      console.error('Error fetching ride data:', err);
      setError('Errore nel caricamento delle corse');
      // Fallback to mock data if API fails
      setAvailableRides([
        {
          id: 'r1',
          departureTime: '10:45',
          price: '2,50€',
          duration: '30 min',
          fromStop: 'La tua posizione',
          toStop: 'Teramo P.zza Garibaldi'
        },
        {
          id: 'r2', 
          departureTime: '11:45',
          price: '2,50€',
          duration: '30 min',
          fromStop: 'La tua posizione',
          toStop: 'Teramo P.zza Garibaldi'
        },
        {
          id: 'r3',
          departureTime: '12:45', 
          price: '2,50€',
          duration: '30 min',
          fromStop: 'La tua posizione',
          toStop: 'Teramo P.zza Garibaldi'
        },
        {
          id: 'r4',
          departureTime: '13:45',
          price: '2,50€', 
          duration: '30 min',
          fromStop: 'La tua posizione',
          toStop: 'Teramo P.zza Garibaldi'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle ride purchase
  const handlePurchase = (rideId: string) => {
    // TODO: Implement purchase flow
    console.log('Purchase ride:', rideId);
  };

  // Handle back navigation with preserved search parameters
  const handleBackToSearch = () => {
    const searchParams = new URLSearchParams();
    
    // Preserve all current search parameters
    if (fromStopId) searchParams.set('from', fromStopId);
    if (toStopId) searchParams.set('to', toStopId);
    if (andataDate) searchParams.set('andata', andataDate);
    if (ritornoDate) searchParams.set('ritorno', ritornoDate);
    
    // Navigate to search page with preserved parameters
    router.push(`/search?${searchParams.toString()}`);
  };

  // Handle back navigation that clears all search parameters
  const handleBackToSearchCleared = () => {
    // Navigate to search page without any parameters (clears searches)
    router.push('/search');
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (   
    <div className="find-i">
      {/* Header with search form */}
      <div className="frame-38">
        <div className="frame-31">
          <div className="frame-10">
            <div className="rectangle-7"></div>
            <div className="da">Da</div>
            <div className="a">A</div>
            <div className="la-tua-posizione">La tua posizione</div>
            <div className="teramo-p-zza-garibaldi">Teramo P.zza Garibaldi</div>
            <div className="frame-7"></div>
            <Image className="frame-9" src="/mobile/search/frame-90.svg" alt="Route" width={39} height={42} />
            <Image className="vector-1" src="/mobile/search/vector-10.svg" alt="Line" width={198} height={0} />
            
            {/* Route dots */}
            <div className="frame-12">
              <div className="ellipse-1"></div>
              <div className="frame-11">
                <div className="ellipse-2"></div>
                <div className="ellipse-3"></div>
                <div className="ellipse-4"></div>
                <div className="ellipse-5"></div>
              </div>
              <div className="frame-8">
                <div className="ellipse-12"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="frame-37">
          <div className="rectangle-10"></div>
          <div className="frame-17">
            <div className="frame-35">
              <Image
                className="entypo-magnifying-glass"
                src="/mobile/search/entypo-magnifying-glass0.svg"
                alt="Search"
                width={11}
                height={11}
              />
              <div className="cerca">Cerca</div>
            </div>
          </div>
        </div>

        {/* Date displays */}
        <div className="frame-30">
          <div className="andata">Andata</div>
          <div className="_11-06-2025">{formatDateDisplay(andataDate)}</div>
        </div>
        <div className="frame-32">
          <div className="ritorno">Ritorno</div>
          <div className="_11-06-2025">{formatDateDisplay(ritornoDate)}</div>
        </div>
      </div>

      {/* Results section */}
      <div className="frame-322">
        <div className="rectangle-9"></div>
        <Image className="scroll" src="/mobile/search/scroll0.svg" alt="Scroll" width={0} height={147} />
        <Image 
          className="chiudi-e-dietro clear-search-button" 
          src="/mobile/search/chiudi-e-dietro0.svg" 
          alt="Pulisci ricerche" 
          width={14.29} 
          height={14.29}
          onClick={handleBackToSearchCleared}
        />
      </div>
      
      <div className="frame-139">
        <div className="orari-completo">
        {/* Loading state */}
        {loading && (
          <div className="loading-message">
            <div className="loading-text">Caricamento corse...</div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="error-message">
            <div className="error-text">{error}</div>
          </div>
        )}
        
        {/* No results */}
        {!loading && !error && availableRides.length === 0 && (
          <div className="no-results">
            <div className="no-results-text">Nessuna corsa trovata per questo percorso</div>
          </div>
        )}
        
        {/* Render available rides */}
        {!loading && availableRides.map((ride, index) => {
          // Handle both API data format and fallback mock data
          const departureTime = ride.departureTime || ride.departureTime;
          const price = ride.price || '2,50€';
          const duration = ride.duration || formatDuration(ride.departureTime || '10:45', ride.arrivalTime || '11:15');
          const fromStopName = ride.originStop?.name || ride.fromStop || 'La tua posizione';
          const toStopName = ride.destinationStop?.name || ride.toStop || 'Teramo P.zza Garibaldi';
          
          return (
            <div key={ride.id} className={`frame-${index === 0 ? '15' : index === 1 ? '15' : index === 2 ? '39' : index === 3 ? '41' : '42'}`}>
              <div className="rectangle-72"></div>
              {index >= 3 && <div className="rectangle-8"></div>}
              <div className="orario">
                <div className="partenza-ore">Partenza ore:</div>
                <div className="_10-45">{departureTime}</div>
              </div>
              <div className="prezzo">
                <div className="prezzo2">Prezzo:</div>
                <div className="_2-50">{price}</div>
              </div>
              <div className="frame-138">
                <div className="frame-137">
                  <div className="ellipse-1"></div>
                  <div className="ellipse-2"></div>
                  <div className="ellipse-3"></div>
                  <div className="ellipse-4"></div>
                  <div className="ellipse-5"></div>
                  <div className="ellipse-13"></div>
                </div>
                <div className="frame-136">
                  <div className="la-tua-posizione2">{fromStopName}</div>
                  <div className="_30-min">{duration}</div>
                  <div className="teramo-p-zza-garibaldi2">{toStopName}</div>
                </div>
              </div>
              <div className="frame-131">
                <Image 
                  className={`vector${index === 0 ? '' : index + 1}`}
                  src={`/mobile/search/vector${index}.svg`}
                  alt="Cart"
                  width={11.67}
                  height={11.67}
                  onClick={() => handlePurchase(ride.id)}
                />
                <div className="acquista">Acquista</div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
      
      <Image className="vector-8" src="/mobile/search/vector-80.svg" alt="Bottom line" width={393} height={0} />

      <style jsx>{`
        .find-i,
        .find-i * {
          box-sizing: border-box;
        }
        .find-i {
          background: #ffffff;
          height: 852px;
          position: relative;
          overflow: hidden;
        }
        .frame-38 {
          width: 334px;
          height: 256px;
          position: absolute;
          left: 29px;
          top: 254px;
        }
        .frame-31 {
          width: 334px;
          height: 122px;
          position: absolute;
          left: 0px;
          top: 0px;
        }
        .frame-10 {
          width: 334px;
          height: 122px;
          position: absolute;
          left: 0px;
          top: 0px;
        }
        .rectangle-7 {
          background: rgba(255, 254, 254, 0.6);
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          width: 334px;
          height: 122px;
          position: absolute;
          left: 0px;
          top: 0px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        }
        .da {
          color: #d6d8dc;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: absolute;
          left: 46px;
          top: 18px;
        }
        .a {
          color: #cecfd2;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: absolute;
          left: 46px;
          top: 71px;
        }
        .la-tua-posizione {
          color: rgba(151, 151, 164, 0.3);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: absolute;
          left: 46px;
          top: 38px;
        }
        .teramo-p-zza-garibaldi {
          color: rgba(139, 139, 152, 0.3);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: absolute;
          left: 48px;
          top: 88px;
        }
        .frame-7 {
          width: 15px;
          height: 15px;
          position: absolute;
          left: 16px;
          top: 18px;
        }
        .frame-9 {
          width: 39px;
          height: 42px;
          position: absolute;
          left: 276px;
          top: 41px;
          overflow: visible;
        }
        .vector-1 {
          width: 198px;
          height: 0px;
          position: absolute;
          left: 46px;
          top: 61px;
          transform: translate(0px, -0.5px);
          overflow: visible;
        }
        .frame-12 {
          display: flex;
          flex-direction: column;
          gap: 9px;
          align-items: center;
          justify-content: flex-start;
          width: 15px;
          position: absolute;
          left: 16px;
          top: 18px;
        }
        .ellipse-1 {
          background: rgba(22, 208, 32, 0.37);
          border-radius: 50%;
          border-style: solid;
          border-color: #16d020;
          border-width: 2.73px;
          align-self: stretch;
          flex-shrink: 0;
          height: 15px;
          position: relative;
        }
        .frame-11 {
          display: flex;
          flex-direction: column;
          gap: 2.44px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }
        .ellipse-2 {
          background: #d9d9d9;
          border-radius: 50%;
          flex-shrink: 0;
          width: 3.67px;
          height: 3.67px;
          position: relative;
        }
        .ellipse-3 {
          background: #d9d9d9;
          border-radius: 50%;
          flex-shrink: 0;
          width: 3.67px;
          height: 3.67px;
          position: relative;
        }
        .ellipse-4 {
          background: #d9d9d9;
          border-radius: 50%;
          flex-shrink: 0;
          width: 3.67px;
          height: 3.67px;
          position: relative;
        }
        .ellipse-5 {
          background: #d9d9d9;
          border-radius: 50%;
          flex-shrink: 0;
          width: 3.67px;
          height: 3.67px;
          position: relative;
        }
        .frame-8 {
          align-self: stretch;
          flex-shrink: 0;
          height: 15px;
          position: relative;
        }
        .ellipse-12 {
          background: rgba(244, 1, 1, 0.41);
          border-radius: 50%;
          border-style: solid;
          border-color: #f40101;
          border-width: 2.73px;
          width: 15px;
          height: 15px;
          position: absolute;
          left: 0px;
          top: 0px;
        }
        .frame-37 {
          width: 109px;
          height: 47px;
          position: absolute;
          left: 113px;
          top: 209px;
        }
        .rectangle-10 {
          background: #162686;
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          width: 109px;
          height: 47px;
          position: absolute;
          left: 0px;
          top: 0px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        }
        .frame-17 {
          display: flex;
          flex-direction: row;
          gap: 1px;
          align-items: center;
          justify-content: flex-start;
          position: absolute;
          left: 28px;
          top: 15px;
        }
        .frame-35 {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          width: 53px;
          position: relative;
        }
        .entypo-magnifying-glass {
          flex-shrink: 0;
          width: 11px;
          height: 11px;
          position: relative;
          overflow: visible;
          aspect-ratio: 1;
        }
        .cerca {
          color: #ffffff;
          text-align: left;
          font-family: "Inter-SemiBold", sans-serif;
          font-size: 14px;
          font-weight: 600;
          position: relative;
        }
        .frame-30 {
          background: rgba(255, 254, 254, 0.6);
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 4px 55px 4px 55px;
          width: 165px;
          height: 51px;
          position: absolute;
          left: 0px;
          top: 136px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        }
        .andata {
          color: #d6d8dc;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: absolute;
          left: 61px;
          top: 4px;
        }
        ._11-06-2025 {
          color: rgba(151, 151, 164, 0.3);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: absolute;
          left: 44px;
          top: 19px;
        }
        .frame-32 {
          background: rgba(255, 254, 254, 0.6);
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 4px 55px 4px 55px;
          width: 165px;
          height: 51px;
          position: absolute;
          left: 169px;
          top: 136px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        }
        .ritorno {
          color: #d6d8dc;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: absolute;
          left: 62px;
          top: 4px;
        }
        .frame-322 {
          width: 393px;
          height: 851px;
          position: absolute;
          left: 0px;
          top: 1px;
        }
        .rectangle-9 {
          background: rgba(21, 37, 128, 0.84);
          width: 393px;
          height: 855px;
          position: absolute;
          left: 0px;
          top: -4px;
        }
        .frame-139 {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: flex-start;
          justify-content: flex-start;
          width: 341px;
          position: absolute;
          left: 25px;
          top: 82px;
        }
        .orari-completo {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: flex-end;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          height: 169px;
          position: relative;
        }
        .frame-15 {
          align-self: stretch;
          flex-shrink: 0;
          height: 169px;
          position: relative;
        }
        .rectangle-72 {
          background: #fffefe;
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          width: 334px;
          height: 166px;
          position: absolute;
          left: 0px;
          top: 3px;
        }
        .orario {
          display: flex;
          flex-direction: column;
          gap: 3px;
          align-items: flex-start;
          justify-content: flex-start;
          width: 90px;
          position: absolute;
          left: 28px;
          top: 16px;
        }
        .partenza-ore {
          color: #b9bbbc;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          align-self: stretch;
        }
        ._10-45 {
          color: #000000;
          text-align: left;
          font-family: "Inter-Bold", sans-serif;
          font-size: 14px;
          font-weight: 700;
          position: relative;
          align-self: stretch;
        }
        .prezzo {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
          justify-content: flex-start;
          width: 90px;
          position: absolute;
          left: 217px;
          top: 16px;
        }
        .prezzo2 {
          color: #b9bbbc;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          align-self: stretch;
        }
        ._2-50 {
          color: #000000;
          text-align: left;
          font-family: "Inter-Bold", sans-serif;
          font-size: 14px;
          font-weight: 700;
          position: relative;
          align-self: stretch;
        }
        .frame-138 {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: space-between;
          width: 186px;
          position: absolute;
          left: 12px;
          top: 79px;
        }
        .frame-137 {
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          width: 15px;
          position: relative;
        }
        .ellipse-13 {
          background: rgba(244, 1, 1, 0.37);
          border-radius: 50%;
          border-style: solid;
          border-color: #f40101;
          border-width: 2.73px;
          align-self: stretch;
          flex-shrink: 0;
          height: 15px;
          position: relative;
        }
        .frame-136 {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          justify-content: flex-start;
          flex-shrink: 0;
          width: 154px;
          position: relative;
        }
        .la-tua-posizione2 {
          color: #9797a4;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          align-self: stretch;
        }
        ._30-min {
          color: rgba(151, 151, 164, 0.36);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          align-self: stretch;
        }
        .teramo-p-zza-garibaldi2 {
          color: #9797a4;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          align-self: stretch;
        }
        .frame-131 {
          background: #16d020;
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 15px;
          display: flex;
          flex-direction: row;
          gap: 3px;
          align-items: center;
          justify-content: center;
          width: 109px;
          height: 47px;
          position: absolute;
          left: 207px;
          top: 67px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        }
        .vector {
          flex-shrink: 0;
          width: 11.67px;
          height: 11.67px;
          position: relative;
          overflow: visible;
          cursor: pointer;
        }
        .vector2 {
          flex-shrink: 0;
          width: 11.67px;
          height: 11.67px;
          position: relative;
          overflow: visible;
          cursor: pointer;
        }
        .vector3 {
          flex-shrink: 0;
          width: 11.67px;
          height: 11.67px;
          position: relative;
          overflow: visible;
          cursor: pointer;
        }
        .vector4 {
          flex-shrink: 0;
          width: 11.67px;
          height: 11.67px;
          position: relative;
          overflow: visible;
          cursor: pointer;
        }
        .vector5 {
          flex-shrink: 0;
          width: 11.67px;
          height: 11.67px;
          position: relative;
          overflow: visible;
          cursor: pointer;
        }
        .acquista {
          color: #ffffff;
          text-align: left;
          font-family: "Inter-SemiBold", sans-serif;
          font-size: 14px;
          font-weight: 600;
          position: relative;
        }
        .frame-39 {
          align-self: stretch;
          flex-shrink: 0;
          height: 169px;
          position: relative;
        }
        .frame-41 {
          align-self: stretch;
          flex-shrink: 0;
          height: 169px;
          position: relative;
        }
        .rectangle-8 {
          background: #fffefe;
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          width: 334px;
          height: 166px;
          position: absolute;
          left: 0px;
          top: 3px;
        }
        .frame-42 {
          align-self: stretch;
          flex-shrink: 0;
          height: 169px;
          position: relative;
        }
        .vector-8 {
          width: 393px;
          height: 0px;
          position: absolute;
          left: 1px;
          top: 50px;
          transform: translate(0px, -0.5px);
          overflow: visible;
        }
        .scroll {
          width: 0px;
          height: 147px;
          position: absolute;
          left: 381px;
          top: 88px;
          overflow: visible;
        }
        .chiudi-e-dietro {
          width: 14.29px;
          height: 14.29px;
          position: absolute;
          left: 355.86px;
          top: 14px;
          overflow: visible;
          cursor: pointer;
        }
        
        /* Loading, Error, and No Results States */
        .loading-message, .error-message, .no-results {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
        }
        
        .loading-text, .error-text, .no-results-text {
          color: #ffffff;
          font-family: "Inter-Medium", sans-serif;
          font-size: 16px;
          font-weight: 500;
        }
        
        .error-text {
          color: #ff6b6b;
        }
        
        /* Clear Search Button Styles */
        .clear-search-button {
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 4px;
          border-radius: 4px;
        }
        
        .clear-search-button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }
        
        .clear-search-button:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}

/**
 * Loading fallback component for Suspense
 */
function SearchResultsLoading() {
  return (
    <div className="find-i">
      <div className="frame-38">
        <div className="frame-31">
          <div className="frame-10">
            <div className="rectangle-7"></div>
            <div className="da">Da</div>
            <div className="a">A</div>
            <div className="la-tua-posizione">La tua posizione</div>
            <div className="teramo-p-zza-garibaldi">Teramo P.zza Garibaldi</div>
            <div className="frame-7"></div>
            <Image className="frame-9" src="/mobile/search/frame-90.svg" alt="Route" width={39} height={42} />
            <Image className="vector-1" src="/mobile/search/vector-10.svg" alt="Line" width={198} height={0} />
            
            {/* Route dots */}
            <div className="frame-12">
              <div className="ellipse-1"></div>
              <div className="frame-11">
                <div className="ellipse-2"></div>
                <div className="ellipse-3"></div>
                <div className="ellipse-4"></div>
                <div className="ellipse-5"></div>
              </div>
              <div className="frame-8">
                <div className="ellipse-12"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="frame-37">
          <div className="rectangle-10"></div>
          <div className="frame-17">
            <div className="frame-35">
              <Image
                className="entypo-magnifying-glass"
                src="/mobile/search/entypo-magnifying-glass0.svg"
                alt="Search"
                width={11}
                height={11}
              />
              <div className="cerca">Cerca</div>
            </div>
          </div>
        </div>

        {/* Date displays */}
        <div className="frame-30">
          <div className="andata">Andata</div>
          <div className="_11-06-2025">-</div>
        </div>
        <div className="frame-32">
          <div className="ritorno">Ritorno</div>
          <div className="_11-06-2025">-</div>
        </div>
      </div>

      {/* Results section */}
      <div className="frame-322">
        <div className="rectangle-9"></div>
        <Image className="scroll" src="/mobile/search/scroll0.svg" alt="Scroll" width={0} height={147} />
        <Image 
          className="chiudi-e-dietro clear-search-button" 
          src="/mobile/search/chiudi-e-dietro0.svg" 
          alt="Pulisci ricerche" 
          width={14.29} 
          height={14.29}
        />
      </div>
      
      <div className="frame-139">
        <div className="orari-completo">
          <div className="loading-message">
            <div className="loading-text">Caricamento...</div>
          </div>
        </div>
      </div>
      
      <Image className="vector-8" src="/mobile/search/vector-80.svg" alt="Bottom line" width={393} height={0} />

      <style jsx>{`
        .find-i,
        .find-i * {
          box-sizing: border-box;
        }
        .find-i {
          background: #ffffff;
          height: 852px;
          position: relative;
          overflow: hidden;
        }
        .frame-38 {
          width: 334px;
          height: 256px;
          position: absolute;
          left: 29px;
          top: 254px;
        }
        .frame-31 {
          width: 334px;
          height: 122px;
          position: absolute;
          left: 0px;
          top: 0px;
        }
        .frame-10 {
          width: 334px;
          height: 122px;
          position: absolute;
          left: 0px;
          top: 0px;
        }
        .rectangle-7 {
          background: rgba(255, 254, 254, 0.6);
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          width: 334px;
          height: 122px;
          position: absolute;
          left: 0px;
          top: 0px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        }
        .da {
          color: #d6d8dc;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: absolute;
          left: 46px;
          top: 18px;
        }
        .a {
          color: #cecfd2;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: absolute;
          left: 46px;
          top: 71px;
        }
        .la-tua-posizione {
          color: rgba(151, 151, 164, 0.3);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: absolute;
          left: 46px;
          top: 38px;
        }
        .teramo-p-zza-garibaldi {
          color: rgba(139, 139, 152, 0.3);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: absolute;
          left: 48px;
          top: 88px;
        }
        .frame-7 {
          width: 15px;
          height: 15px;
          position: absolute;
          left: 16px;
          top: 18px;
        }
        .frame-9 {
          width: 39px;
          height: 42px;
          position: absolute;
          left: 276px;
          top: 41px;
          overflow: visible;
        }
        .vector-1 {
          width: 198px;
          height: 0px;
          position: absolute;
          left: 46px;
          top: 61px;
          transform: translate(0px, -0.5px);
          overflow: visible;
        }
        .frame-12 {
          display: flex;
          flex-direction: column;
          gap: 9px;
          align-items: center;
          justify-content: flex-start;
          width: 15px;
          position: absolute;
          left: 16px;
          top: 18px;
        }
        .ellipse-1 {
          background: rgba(22, 208, 32, 0.37);
          border-radius: 50%;
          border-style: solid;
          border-color: #16d020;
          border-width: 2.73px;
          align-self: stretch;
          flex-shrink: 0;
          height: 15px;
          position: relative;
        }
        .frame-11 {
          display: flex;
          flex-direction: column;
          gap: 2.44px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }
        .ellipse-2 {
          background: #d9d9d9;
          border-radius: 50%;
          flex-shrink: 0;
          width: 3.67px;
          height: 3.67px;
          position: relative;
        }
        .ellipse-3 {
          background: #d9d9d9;
          border-radius: 50%;
          flex-shrink: 0;
          width: 3.67px;
          height: 3.67px;
          position: relative;
        }
        .ellipse-4 {
          background: #d9d9d9;
          border-radius: 50%;
          flex-shrink: 0;
          width: 3.67px;
          height: 3.67px;
          position: relative;
        }
        .ellipse-5 {
          background: #d9d9d9;
          border-radius: 50%;
          flex-shrink: 0;
          width: 3.67px;
          height: 3.67px;
          position: relative;
        }
        .frame-8 {
          align-self: stretch;
          flex-shrink: 0;
          height: 15px;
          position: relative;
        }
        .ellipse-12 {
          background: rgba(244, 1, 1, 0.41);
          border-radius: 50%;
          border-style: solid;
          border-color: #f40101;
          border-width: 2.73px;
          width: 15px;
          height: 15px;
          position: absolute;
          left: 0px;
          top: 0px;
        }
        .frame-37 {
          width: 109px;
          height: 47px;
          position: absolute;
          left: 113px;
          top: 209px;
        }
        .rectangle-10 {
          background: #162686;
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          width: 109px;
          height: 47px;
          position: absolute;
          left: 0px;
          top: 0px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        }
        .frame-17 {
          display: flex;
          flex-direction: row;
          gap: 1px;
          align-items: center;
          justify-content: flex-start;
          position: absolute;
          left: 28px;
          top: 15px;
        }
        .frame-35 {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          width: 53px;
          position: relative;
        }
        .entypo-magnifying-glass {
          flex-shrink: 0;
          width: 11px;
          height: 11px;
          position: relative;
          overflow: visible;
          aspect-ratio: 1;
        }
        .cerca {
          color: #ffffff;
          text-align: left;
          font-family: "Inter-SemiBold", sans-serif;
          font-size: 14px;
          font-weight: 600;
          position: relative;
        }
        .frame-30 {
          background: rgba(255, 254, 254, 0.6);
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 4px 55px 4px 55px;
          width: 165px;
          height: 51px;
          position: absolute;
          left: 0px;
          top: 136px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        }
        .andata {
          color: #d6d8dc;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: absolute;
          left: 61px;
          top: 4px;
        }
        ._11-06-2025 {
          color: rgba(151, 151, 164, 0.3);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: absolute;
          left: 44px;
          top: 19px;
        }
        .frame-32 {
          background: rgba(255, 254, 254, 0.6);
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 4px 55px 4px 55px;
          width: 165px;
          height: 51px;
          position: absolute;
          left: 169px;
          top: 136px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        }
        .ritorno {
          color: #d6d8dc;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: absolute;
          left: 62px;
          top: 4px;
        }
        .frame-322 {
          width: 393px;
          height: 851px;
          position: absolute;
          left: 0px;
          top: 1px;
        }
        .rectangle-9 {
          background: rgba(21, 37, 128, 0.84);
          width: 393px;
          height: 855px;
          position: absolute;
          left: 0px;
          top: -4px;
        }
        .frame-139 {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: flex-start;
          justify-content: flex-start;
          width: 341px;
          position: absolute;
          left: 25px;
          top: 82px;
        }
        .orari-completo {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: flex-end;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          height: 169px;
          position: relative;
        }
        .vector-8 {
          width: 393px;
          height: 0px;
          position: absolute;
          left: 1px;
          top: 50px;
          transform: translate(0px, -0.5px);
          overflow: visible;
        }
        .scroll {
          width: 0px;
          height: 147px;
          position: absolute;
          left: 381px;
          top: 88px;
          overflow: visible;
        }
        .chiudi-e-dietro {
          width: 14.29px;
          height: 14.29px;
          position: absolute;
          left: 355.86px;
          top: 14px;
          overflow: visible;
          cursor: pointer;
        }
        
        /* Loading State */
        .loading-message {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
        }
        
        .loading-text {
          color: #ffffff;
          font-family: "Inter-Medium", sans-serif;
          font-size: 16px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

/**
 * Search Results Page - Shows available rides based on search criteria
 * Based on the design from searchPage/index.html
 */
export default function SearchResultsPage() {
  return (
    <Suspense fallback={<SearchResultsLoading />}>
      <SearchResultsContent />
    </Suspense>
  );
}

