'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { stops, stopIdToStop, formatDuration } from '../../lib/data';
import type { Stop } from '../../lib/data';
import { BackArrowIcon, CloseIcon } from '../../components/mobile/icons';

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
      setAvailableRides([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate duration between departure and arrival times
  const calculateDuration = (departureTime: string, arrivalTime: string) => {
    const toMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const departureMinutes = toMinutes(departureTime);
    const arrivalMinutes = toMinutes(arrivalTime);
    const durationMinutes = arrivalMinutes - departureMinutes;
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours <= 0) return `${minutes} min`;
    return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
  };

  // Calculate proportional price based on route distance
  const calculateProportionalPrice = (ride: any) => {
    // Base price for minimum distance
    const basePrice = 1.50;
    const pricePerKm = 0.15;
    
    // Estimate distance based on number of stops (rough approximation)
    const totalStops = 1 + (ride.intermediateStops?.length || 0) + 1; // origin + intermediate + destination
    const estimatedKm = Math.max(5, (totalStops - 1) * 3); // minimum 5km, ~3km per stop
    
    const calculatedPrice = basePrice + (estimatedKm * pricePerKm);
    return `€${calculatedPrice.toFixed(2)}`;
  };

  // Build route stops for specific searched path using API response data
  const buildRouteStops = (ride: any) => {
    const stops = [];
    
    // Add origin stop (the searched departure stop)
    stops.push({
      name: ride.originStop?.name || 'Partenza',
      time: ride.departureTime,
      isOrigin: true,
      isDestination: false,
      city: ride.originStop?.city || null
    });
    
    // Add intermediate stops that are part of the specific route
    // The API returns intermediateStops with stopName, time, and city details
    // This array contains only the stops between origin and destination for the searched route
    if (ride.intermediateStops && Array.isArray(ride.intermediateStops) && ride.intermediateStops.length > 0) {
      ride.intermediateStops.forEach((intermediateStop: any) => {
        stops.push({
          name: intermediateStop.stopName || `Stop ${intermediateStop.stopId}`,
          time: intermediateStop.time,
          isOrigin: false,
          isDestination: false,
          city: intermediateStop.city || null
        });
      });
    }
    
    // Add destination stop (the searched arrival stop)
    stops.push({
      name: ride.destinationStop?.name || 'Arrivo',
      time: ride.arrivalTime,
      isOrigin: false,
      isDestination: true,
      city: ride.destinationStop?.city || null
    });
    
    return stops;
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

  // Handle switching between departure and arrival stops
  const handleSwitchStops = () => {
    if (fromStop && toStop) {
      // Swap the stops
      const newFromStop = toStop;
      const newToStop = fromStop;
      
      // Update state
      setFromStop(newFromStop);
      setToStop(newToStop);
      
      // Update URL parameters
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('from', newFromStop.id);
      newSearchParams.set('to', newToStop.id);
      if (andataDate) newSearchParams.set('andata', andataDate);
      if (ritornoDate) newSearchParams.set('ritorno', ritornoDate);
      
      // Update URL without triggering a page reload
      router.replace(`/search-results?${newSearchParams.toString()}`);
      
      // Fetch new ride data with swapped stops
      fetchRideData(newFromStop.id, newToStop.id);
    }
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
    <div style={{width: 393, height: 852, position: 'relative', background: 'white', overflow: 'hidden'}}>
      {/* Header with search form */}
      <div style={{width: 334, height: 256, left: 29, top: 254, position: 'absolute'}}>
        <div style={{width: 334, height: 122, left: 0, top: 0, position: 'absolute'}}>
          <div style={{width: 334, height: 122, left: 0, top: 0, position: 'absolute'}}>
            <div style={{width: 334, height: 122, left: 0, top: 0, position: 'absolute', background: 'rgba(255, 253.75, 253.75, 0.60)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 16, border: '1px rgba(0, 0, 0, 0.17) solid'}} />
            <div style={{left: 46, top: 18, position: 'absolute', color: '#D6D8DC', fontSize: 12, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Da</div>
            <div style={{left: 46, top: 71, position: 'absolute', color: '#CECFD2', fontSize: 12, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>A</div>
            <div style={{left: 46, top: 38, position: 'absolute', color: 'rgba(151, 151, 164, 0.30)', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{fromStop?.name || 'La tua posizione'}</div>
            <div style={{left: 48, top: 88, position: 'absolute', color: 'rgba(139, 139, 152, 0.30)', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{toStop?.name || 'Teramo P.zza Garibaldi'}</div>
            <div style={{width: 15, height: 15, left: 16, top: 18, position: 'absolute'}} />
            <div 
              style={{
                width: 39, 
                height: 42, 
                left: 276, 
                top: 41, 
                position: 'absolute',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={handleSwitchStops}
            >
              <div style={{width: 39, height: 42, left: 0, top: 0, position: 'absolute', background: 'rgba(217, 217, 217, 0.54)', borderRadius: 6}} />
              <div style={{width: 8.50, height: 11.33, left: 11, top: 11, position: 'absolute', outline: '0.75px #9797A4 solid', outlineOffset: '-0.38px'}} />
              <div style={{width: 8.50, height: 11.33, left: 26.25, top: 30.50, position: 'absolute', transform: 'rotate(-180deg)', transformOrigin: 'top left', outline: '0.75px #9797A4 solid', outlineOffset: '-0.38px'}} />
            </div>
            <div style={{width: 15, left: 16, top: 18, position: 'absolute', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 9, display: 'inline-flex'}}>
              <div style={{alignSelf: 'stretch', height: 15, background: 'rgba(22, 208, 32, 0.37)', borderRadius: 9999, border: '2.73px #16D020 solid'}} />
              <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2.44, display: 'flex'}}>
                <div style={{width: 3.67, height: 3.67, background: '#D9D9D9', borderRadius: 9999}} />
                <div style={{width: 3.67, height: 3.67, background: '#D9D9D9', borderRadius: 9999}} />
                <div style={{width: 3.67, height: 3.67, background: '#D9D9D9', borderRadius: 9999}} />
                <div style={{width: 3.67, height: 3.67, background: '#D9D9D9', borderRadius: 9999}} />
              </div>
              <div style={{alignSelf: 'stretch', height: 15, position: 'relative'}}>
                <div style={{width: 15, height: 15, left: 0, top: 0, position: 'absolute', background: 'rgba(244, 1, 1, 0.41)', borderRadius: 9999, border: '2.73px #F40101 solid'}} />
              </div>
            </div>
          </div>
        </div>
        <div style={{width: 109, height: 47, left: 113, top: 209, position: 'absolute'}}>
          <div style={{width: 109, height: 47, left: 0, top: 0, position: 'absolute', background: '#162686', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 16, border: '1px rgba(0, 0, 0, 0.17) solid'}} />
          <div style={{left: 28, top: 15, position: 'absolute', justifyContent: 'flex-start', alignItems: 'center', gap: 1, display: 'inline-flex'}}>
            <div style={{width: 53, justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
              <div style={{width: 11, height: 11, position: 'relative', overflow: 'hidden'}}>
                <div style={{width: 11, height: 11, left: 0, top: 0, position: 'absolute', background: 'white'}} />
              </div>
              <div style={{color: 'white', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Cerca</div>
            </div>
          </div>
        </div>
        <div style={{width: 165, height: 51, left: 0, top: 136, position: 'absolute', background: 'rgba(255, 253.75, 253.75, 0.60)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 16, outline: '1px rgba(0, 0, 0, 0.17) solid', outlineOffset: '-1px'}}>
          <div style={{left: 61, top: 4, position: 'absolute', color: '#D6D8DC', fontSize: 12, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Andata</div>
          <div style={{left: 44, top: 19, position: 'absolute', color: 'rgba(151, 151, 164, 0.30)', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{formatDateDisplay(andataDate)}</div>
        </div>
        <div style={{width: 165, height: 51, left: 169, top: 136, position: 'absolute', background: 'rgba(255, 253.75, 253.75, 0.60)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 16, outline: '1px rgba(0, 0, 0, 0.17) solid', outlineOffset: '-1px'}}>
          <div style={{left: 62, top: 4, position: 'absolute', color: '#D6D8DC', fontSize: 12, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Ritorno</div>
          <div style={{left: 44, top: 19, position: 'absolute', color: 'rgba(151, 151, 164, 0.30)', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{formatDateDisplay(ritornoDate)}</div>
        </div>
      </div>

      {/* Results section */}
      <div style={{width: 393, height: 851, left: 0, top: 1, position: 'absolute'}}>
        <div style={{width: 393, height: 855, left: 0, top: -4, position: 'absolute', background: 'rgba(21, 37, 128, 0.84)'}} />
      </div>
      <div style={{width: 393, height: 50, paddingLeft: 17, paddingRight: 17, paddingTop: 16, paddingBottom: 16, left: 0, top: 0, position: 'absolute', background: '#3A4894', borderBottom: '1px #5764AC solid', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
        <BackArrowIcon onClick={handleBackToSearch} />
        <CloseIcon onClick={handleBackToSearchCleared} />
      </div>
      
      <div style={{width: 334, left: 30, top: 64, position: 'absolute', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 19, display: 'inline-flex'}}>
        {/* Loading state */}
        {loading && (
          <div style={{alignSelf: 'stretch', height: 169, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 20, display: 'flex'}}>
            <div style={{color: '#ffffff', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Caricamento corse...</div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div style={{alignSelf: 'stretch', height: 169, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 20, display: 'flex'}}>
            <div style={{color: '#ff6b6b', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{error}</div>
          </div>
        )}
        
        {/* No results */}
        {!loading && !error && availableRides.length === 0 && (
          <div style={{alignSelf: 'stretch', height: 169, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 20, display: 'flex'}}>
            <div style={{color: '#ffffff', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Nessuna corsa trovata per questo percorso</div>
          </div>
        )}
        
        {/* Render available rides */}
        {!loading && availableRides.map((ride, index) => {
          // Use the new functions to calculate route-specific data
          const departureTime = ride.departureTime;
          const arrivalTime = ride.arrivalTime;
          const duration = calculateDuration(departureTime, arrivalTime);
          const price = calculateProportionalPrice(ride);
          
          // Build route stops for the specific searched path
          const routeStops = buildRouteStops(ride);
          
          // Debug: Log route stops to verify intermediate stops are included
          console.log(`Route stops for ride ${ride.id}:`, routeStops);
          
          return (
            <div key={ride.id} style={{alignSelf: 'stretch', height: 169, position: 'relative'}}>
              <div style={{width: 334, height: 166, left: 0, top: 3, position: 'absolute', background: '#FFFEFE', borderRadius: 16, border: '1px rgba(0, 0, 0, 0.17) solid'}} />
              <div style={{width: 90, left: 28, top: 16, position: 'absolute', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 3, display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', color: '#B9BBBC', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Partenza ore:</div>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>{departureTime}</div>
              </div>
              <div style={{width: 90, left: 217, top: 16, position: 'absolute', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 6, display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', color: '#B9BBBC', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Prezzo:</div>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>{price}</div>
              </div>
              
              {/* Route visualization with specific searched path stops */}
              <div style={{left: 12, top: 79, position: 'absolute', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 17, display: 'inline-flex'}}>
                <div style={{width: 15, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 5, display: 'inline-flex'}}>
                  {routeStops.map((stop, stopIndex) => (
                    <div key={stopIndex} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5}}>
                      {/* Stop indicator */}
                      <div style={{
                        width: 15,
                        height: 15,
                        background: stop.isOrigin ? 'rgba(22, 208, 32, 0.37)' : stop.isDestination ? 'rgba(244, 1, 1, 0.37)' : 'rgba(217, 217, 217, 0.54)',
                        borderRadius: 9999,
                        border: stop.isOrigin ? '2.73px #16D020 solid' : stop.isDestination ? '2.73px #F40101 solid' : '2.73px #D9D9D9 solid'
                      }} />
                      
                      {/* Connection line between stops - only show if not the last stop */}
                      {stopIndex < routeStops.length - 1 && (
                        <div style={{
                          width: 3.67, 
                          height: routeStops.length > 2 ? 12 : 15, // Shorter lines when there are intermediate stops
                          background: '#D9D9D9', 
                          borderRadius: 9999
                        }} />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Stop names and times */}
                <div style={{width: 290, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: routeStops.length > 2 ? 8 : 10, display: 'inline-flex'}}>
                  {routeStops.map((stop, stopIndex) => (
                    <div key={stopIndex} style={{alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: 'column', gap: 2}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                        <div style={{
                          color: stop.isOrigin || stop.isDestination ? '#9797A4' : 'rgba(151, 151, 164, 0.60)',
                          fontSize: 14,
                          fontFamily: 'Inter',
                          fontWeight: stop.isOrigin || stop.isDestination ? '500' : '400',
                          wordWrap: 'break-word',
                          flex: 1
                        }}>
                          {stop.name}
                        </div>
                        <div style={{
                          color: 'rgba(151, 151, 164, 0.60)',
                          fontSize: 12,
                          fontFamily: 'Inter',
                          fontWeight: '400',
                          wordWrap: 'break-word',
                          marginLeft: 10
                        }}>
                          {stop.time}
                        </div>
                      </div>
                      
                      {/* Show city for intermediate stops */}
                      {stop.city && !stop.isOrigin && !stop.isDestination && (
                        <div style={{
                          color: 'rgba(151, 151, 164, 0.40)',
                          fontSize: 11,
                          fontFamily: 'Inter',
                          fontWeight: '400',
                          wordWrap: 'break-word',
                          fontStyle: 'italic'
                        }}>
                          {stop.city}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Duration - shows actual route-specific travel time */}
                  <div style={{alignSelf: 'stretch', color: 'rgba(151, 151, 164, 0.36)', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word', marginTop: 5}}>
                    Durata: {duration}
                  </div>
                </div>
              </div>
              
              <div style={{width: 109, height: 47, padding: 15, left: 207, top: 67, position: 'absolute', background: '#16D020', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 16, outline: '1px rgba(0, 0, 0, 0.17) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 3, display: 'inline-flex'}}>
                <div style={{width: 11.67, height: 11.67, background: 'white', cursor: 'pointer'}} onClick={() => handlePurchase(ride.id)} />
                <div style={{color: 'white', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Acquista</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Loading fallback component for Suspense
 */
function SearchResultsLoading() {
  return (
    <div style={{width: 393, height: 852, position: 'relative', background: 'white', overflow: 'hidden'}}>
      {/* Header with search form */}
      <div style={{width: 334, height: 256, left: 29, top: 254, position: 'absolute'}}>
        <div style={{width: 334, height: 122, left: 0, top: 0, position: 'absolute'}}>
          <div style={{width: 334, height: 122, left: 0, top: 0, position: 'absolute'}}>
            <div style={{width: 334, height: 122, left: 0, top: 0, position: 'absolute', background: 'rgba(255, 253.75, 253.75, 0.60)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 16, border: '1px rgba(0, 0, 0, 0.17) solid'}} />
            <div style={{left: 46, top: 18, position: 'absolute', color: '#D6D8DC', fontSize: 12, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Da</div>
            <div style={{left: 46, top: 71, position: 'absolute', color: '#CECFD2', fontSize: 12, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>A</div>
            <div style={{left: 46, top: 38, position: 'absolute', color: 'rgba(151, 151, 164, 0.30)', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>La tua posizione</div>
            <div style={{left: 48, top: 88, position: 'absolute', color: 'rgba(139, 139, 152, 0.30)', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Teramo P.zza Garibaldi</div>
            <div style={{width: 15, height: 15, left: 16, top: 18, position: 'absolute'}} />
            <div style={{width: 39, height: 42, left: 276, top: 41, position: 'absolute'}}>
              <div style={{width: 39, height: 42, left: 0, top: 0, position: 'absolute', background: 'rgba(217, 217, 217, 0.54)', borderRadius: 6}} />
              <div style={{width: 8.50, height: 11.33, left: 11, top: 11, position: 'absolute', outline: '0.75px #9797A4 solid', outlineOffset: '-0.38px'}} />
              <div style={{width: 8.50, height: 11.33, left: 26.25, top: 30.50, position: 'absolute', transform: 'rotate(-180deg)', transformOrigin: 'top left', outline: '0.75px #9797A4 solid', outlineOffset: '-0.38px'}} />
            </div>
            <div style={{width: 15, left: 16, top: 18, position: 'absolute', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 9, display: 'inline-flex'}}>
              <div style={{alignSelf: 'stretch', height: 15, background: 'rgba(22, 208, 32, 0.37)', borderRadius: 9999, border: '2.73px #16D020 solid'}} />
              <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2.44, display: 'flex'}}>
                <div style={{width: 3.67, height: 3.67, background: '#D9D9D9', borderRadius: 9999}} />
                <div style={{width: 3.67, height: 3.67, background: '#D9D9D9', borderRadius: 9999}} />
                <div style={{width: 3.67, height: 3.67, background: '#D9D9D9', borderRadius: 9999}} />
                <div style={{width: 3.67, height: 3.67, background: '#D9D9D9', borderRadius: 9999}} />
              </div>
              <div style={{alignSelf: 'stretch', height: 15, position: 'relative'}}>
                <div style={{width: 15, height: 15, left: 0, top: 0, position: 'absolute', background: 'rgba(244, 1, 1, 0.41)', borderRadius: 9999, border: '2.73px #F40101 solid'}} />
              </div>
            </div>
          </div>
        </div>
        <div style={{width: 109, height: 47, left: 113, top: 209, position: 'absolute'}}>
          <div style={{width: 109, height: 47, left: 0, top: 0, position: 'absolute', background: '#162686', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 16, border: '1px rgba(0, 0, 0, 0.17) solid'}} />
          <div style={{left: 28, top: 15, position: 'absolute', justifyContent: 'flex-start', alignItems: 'center', gap: 1, display: 'inline-flex'}}>
            <div style={{width: 53, justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
              <div style={{width: 11, height: 11, position: 'relative', overflow: 'hidden'}}>
                <div style={{width: 11, height: 11, left: 0, top: 0, position: 'absolute', background: 'white'}} />
              </div>
              <div style={{color: 'white', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Cerca</div>
            </div>
          </div>
        </div>
        <div style={{width: 165, height: 51, left: 0, top: 136, position: 'absolute', background: 'rgba(255, 253.75, 253.75, 0.60)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 16, outline: '1px rgba(0, 0, 0, 0.17) solid', outlineOffset: '-1px'}}>
          <div style={{left: 61, top: 4, position: 'absolute', color: '#D6D8DC', fontSize: 12, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Andata</div>
          <div style={{left: 44, top: 19, position: 'absolute', color: 'rgba(151, 151, 164, 0.30)', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>-</div>
        </div>
        <div style={{width: 165, height: 51, left: 169, top: 136, position: 'absolute', background: 'rgba(255, 253.75, 253.75, 0.60)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 16, outline: '1px rgba(0, 0, 0, 0.17) solid', outlineOffset: '-1px'}}>
          <div style={{left: 62, top: 4, position: 'absolute', color: '#D6D8DC', fontSize: 12, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Ritorno</div>
          <div style={{left: 44, top: 19, position: 'absolute', color: 'rgba(151, 151, 164, 0.30)', fontSize: 14, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>-</div>
        </div>
      </div>

      {/* Results section */}
      <div style={{width: 393, height: 851, left: 0, top: 1, position: 'absolute'}}>
        <div style={{width: 393, height: 855, left: 0, top: -4, position: 'absolute', background: 'rgba(21, 37, 128, 0.84)'}} />
      </div>
      <div style={{width: 393, height: 50, paddingLeft: 17, paddingRight: 17, paddingTop: 16, paddingBottom: 16, left: 0, top: 0, position: 'absolute', background: '#3A4894', borderBottom: '1px #5764AC solid', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
        <BackArrowIcon onClick={() => window.history.back()} />
        <CloseIcon onClick={() => window.location.href = '/search'} />
      </div>
      
      <div style={{width: 334, left: 30, top: 64, position: 'absolute', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 19, display: 'inline-flex'}}>
        <div style={{alignSelf: 'stretch', height: 169, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 20, display: 'flex'}}>
          <div style={{color: '#ffffff', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Caricamento...</div>
        </div>
      </div>
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

