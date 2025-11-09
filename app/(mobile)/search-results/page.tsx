'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { stops, stopIdToStop, formatDuration } from '../../lib/data';
import { truncateStopName } from '../../lib/textUtils';
import type { Stop } from '../../lib/data';

// Force dynamic rendering since this page depends on search parameters
export const dynamic = 'force-dynamic';

/**
 * Capitalize the first letter of each word (title case)
 * Examples: "LEOFARA" -> "Leofara", "MACCHIA DA SOLE" -> "Macchia Da Sole"
 */
function capitalizeWords(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Loading component for search results
 */
function SearchResultsLoading() {
  return null;
}

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
  const [visibleRideCount, setVisibleRideCount] = useState(3);
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
      
      const response = await fetch(`/api/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&useIntermediate=true`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ride data');
      }
      
      const data = await response.json();
      setAvailableRides(data.results || []);
    } catch (err) {
      console.error('Error fetching ride data:', err);
      setError('Errore nel caricamento delle corse');
      setAvailableRides([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset visible rides when results change
  useEffect(() => {
    if (!loading) {
      setVisibleRideCount(3);
    }
  }, [availableRides, loading]);

  // Handle ride purchase
  const handlePurchase = (rideId: string) => {
    // Navigate to buy page with ride ID
    router.push(`/buy?rideId=${encodeURIComponent(rideId)}`);
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
            <div className="frame-7"></div>
            <div className="frame-9"></div>
            <div className="vector-1"></div>
            
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
                src="/mobile/search/entypo-magnifying-glass0.svg"
                alt="Search"
                width={11}
                height={11}
                className="entypo-magnifying-glass"
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
        {/* Back button */}
        <div className="frame-161">

        <div className="frame-back" onClick={handleBackToSearch}>
          <div className="back-arrow-wrapper">
            <Image
              src="/mobile/search/frame-410.svg"
              alt="Back"
              width={18}
              height={16}
              className="back-arrow"
            />
          </div>
        </div>
        {/* Close button */}
        <div className="chiudi-e-dietro clear-search-button" onClick={handleBackToSearchCleared}>
          <Image
            src="/mobile/search/frame-580.svg"
            alt="Close"
            width={16}
            height={16}
            className="close-icon"
          />
        </div>
       </div>
       
       <div className="frame-139">
        <div className="orari-completo">
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
        {!loading && availableRides.slice(0, visibleRideCount).map((ride, index) => {
          const departureTime = ride.departureTime;
          const price = ride.price || '€2,50';
          const duration = ride.duration || formatDuration(ride.departureTime || '10:45', ride.arrivalTime || '11:15');
          const fromStopName = ride.originStop?.name || 'La tua posizione';
          const toStopName = ride.destinationStop?.name || 'Teramo P.zza Garibaldi';

          return (
            <div key={ride.id} className={`frame-${index === 0 ? '15' : index === 1 ? '15' : index === 2 ? '39' : index === 3 ? '41' : '42'}`}>
              <div className="rectangle-72">

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
                  <div className="la-tua-posizione2">{truncateStopName(capitalizeWords(fromStopName))}</div>
                  <div className="_30-min">{duration}</div>
                  <div className="teramo-p-zza-garibaldi2">{truncateStopName(capitalizeWords(toStopName))}</div>
                </div>
              </div>
              <div className="frame-131" onClick={() => handlePurchase(ride.id)}>
                <Image
                  src="/mobile/search/mdi-cart-outline0.svg"
                  alt="Cart"
                  width={14}
                  height={14}
                  className="cart-icon"
                  />
                <div className="acquista">Acquista</div>
              </div>
             </div>
            </div>
          );
        })}
        
        {/* Altro button */}
        {!loading && !error && availableRides.length > visibleRideCount && (
          <div className="frame-altro">
            <button
              className="altro-button"
              onClick={() =>
                setVisibleRideCount((prev) =>
                  Math.min(prev + 3, availableRides.length)
                )
              }
            >
              <div className="altro-text">Altro</div>
            </button>
          </div>
        )}
        </div>
       </div>
      </div>
    
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
          background: #F49401;
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
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0px;
          top: 0px;
          z-index: 998;
        }
        .rectangle-9 {
          background: rgba(21, 37, 128, 0.8);
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0px;
          top: 0px;
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
          top: 91px;
          bottom: 20px;
          z-index: 997;
          overflow-y: auto;
          overflow-x: hidden;
          padding-bottom: 40px;
        }
        .frame-139::-webkit-scrollbar {
          width: 2px;
        }
        .frame-139::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 0;
        }
        .frame-139::-webkit-scrollbar-thumb {
          background: rgba(200, 200, 210, 0.4);
          border-radius: 0;
          border: none;
        }
        .frame-139::-webkit-scrollbar-thumb:hover {
          background: rgba(200, 200, 210, 0.6);
        }
        /* Firefox scrollbar */
        .frame-139 {
          scrollbar-width: thin;
          scrollbar-color: rgba(200, 200, 210, 0.4) transparent;
        }
        .orari-completo {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: flex-end;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          min-height: auto;
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
          height: 176px;
          position: absolute;
          left: 3.5px;
          top: 31px;
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
          align-items: center;
          justify-content: space-between;
          width: 186px;
          position: absolute;
          left: 12px;
          top: 79px;
        }
        .frame-137 {
          display: flex;
          flex-direction: column;
          gap: 6px;
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
          height: 57px;
          position: absolute;
          left: 207px;
          top: 77px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          cursor: pointer;
        }
        .cart-icon {
          flex-shrink: 0;
          width: 14px;
          height: 14px;
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
        .frame-altro {
          align-self: stretch;
          flex-shrink: 0;
          height: auto;
          position: relative;
          margin-top: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px 0;
        }
        .altro-button {
          background: #F49401;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          width: 109px;
          height: 47px;
          padding: 0;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .altro-button:hover {
          background: #e68501;
        }
        .altro-button:active {
          transform: scale(0.95);
        }
        .altro-text {
          color: #ffffff;
          text-align: center;
          font-family: "Inter-SemiBold", sans-serif;
          font-size: 14px;
          font-weight: 600;
          position: relative;
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
        
        .chiudi-e-dietro {
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
        }
        
        .chiudi-e-dietro:hover {
          opacity: 0.8;
        }
        
        .chiudi-e-dietro:active {
          transform: translateY(-50%) scale(0.95);
        }
        
        .close-icon {
          width: 16px;
          height: 16px;
          position: relative;
          overflow: visible;
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
      `}</style>
  </div>
);
}

/**
 * Main Search Results Page - Wraps Content with Suspense for useSearchParams
 */
export default function SearchResultsPage() {
  return (
    <Suspense fallback={null}>
      <SearchResultsContent />
    </Suspense>
  );
}

