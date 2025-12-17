'use client';

import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Calendar from '../../components/mobile/Calendar';
import StopsModal from '../../components/mobile/StopsModal';
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
 * Search Content Component - Contains the main logic that uses useSearchParams
*/
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  /**
     * Get the admin login page
     */
  const getAdminLoginPage = () => {
    router.push('/admin/login');
  }
  

  
  // State for date selection
  const [andataDate, setAndataDate] = useState<Date | null>(null);
  const [ritornoDate, setRitornoDate] = useState<Date | null>(null);
  const [isAndataCalendarOpen, setIsAndataCalendarOpen] = useState(false);
  const [isRitornoCalendarOpen, setIsRitornoCalendarOpen] = useState(false);
  const [showAndataError, setShowAndataError] = useState(false);
  
  // State for validation errors
  const [showFromStopError, setShowFromStopError] = useState(false);
  const [showToStopError, setShowToStopError] = useState(false);

  // State for stops selection
  const [stops, setStops] = useState<Stop[]>([]);
  const [fromStop, setFromStop] = useState<Stop | null>(null);
  const [toStop, setToStop] = useState<Stop | null>(null);
  const [isFromStopModalOpen, setIsFromStopModalOpen] = useState(false);
  const [isToStopModalOpen, setIsToStopModalOpen] = useState(false);
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orangeGradient =
    'linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%)';

  // Load stops from API on component mount
  useEffect(() => {
    const loadStops = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/stops');
        if (!response.ok) {
          throw new Error('Failed to fetch stops');
        }
        const stopsData = await response.json();
        setStops(stopsData);
      } catch (err) {
        console.error('Error loading stops:', err);
        setError('Errore nel caricamento delle fermate. Riprova più tardi.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStops();
  }, []);

  // Helper function to parse date from URL (handles both YYYY-MM-DD and ISO formats)
  const parseDateFromUrl = (dateStr: string): Date | null => {
    try {
      // Check if it's a YYYY-MM-DD format (local date)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      // Otherwise try to parse as ISO or other format
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        // If it's an ISO format, extract local date parts to avoid timezone issues
        if (dateStr.includes('T')) {
          const datePart = dateStr.split('T')[0];
          const [year, month, day] = datePart.split('-').map(Number);
          return new Date(year, month - 1, day);
        }
        return date;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Load search parameters from URL on component mount
  useEffect(() => {
    const fromStopId = searchParams.get('from');
    const toStopId = searchParams.get('to');
    const andataParam = searchParams.get('andata');
    const ritornoParam = searchParams.get('ritorno');

    // Set dates if provided
    if (andataParam) {
      const parsedDate = parseDateFromUrl(andataParam);
      if (parsedDate) {
        setAndataDate(parsedDate);
      } else {
        console.error('Invalid andata date:', andataParam);
      }
    }
    
    if (ritornoParam) {
      const parsedDate = parseDateFromUrl(ritornoParam);
      if (parsedDate) {
        setRitornoDate(parsedDate);
      } else {
        console.error('Invalid ritorno date:', ritornoParam);
      }
    }

    // Set stops if provided (will be set after stops are loaded)
    if (fromStopId || toStopId) {
      // Wait for stops to be loaded, then set the selected stops
      const setStopsFromParams = () => {
        if (stops.length > 0) {
          if (fromStopId) {
            const fromStop = stops.find(stop => stop.id === fromStopId);
            if (fromStop) setFromStop(fromStop);
          }
          if (toStopId) {
            const toStop = stops.find(stop => stop.id === toStopId);
            if (toStop) setToStop(toStop);
          }
        }
      };

      // If stops are already loaded, set them immediately
      if (stops.length > 0) {
        setStopsFromParams();
      } else {
        // Otherwise, wait for stops to load
        const interval = setInterval(() => {
          if (stops.length > 0) {
            setStopsFromParams();
            clearInterval(interval);
          }
        }, 100);

        // Cleanup interval after 5 seconds to avoid infinite loop
        setTimeout(() => clearInterval(interval), 5000);
      }
    }
  }, [searchParams, stops]);

  // Format date for display
  const formatDateDisplay = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Handle date selection
  const handleAndataDateSelect = (date: Date) => {
    setAndataDate(date);
    setShowAndataError(false); // Clear error when date is selected
    // If ritorno date is before andata date, clear it
    if (ritornoDate && ritornoDate < date) {
      setRitornoDate(null);
    }
  };

  const handleRitornoDateSelect = (date: Date) => {
    setRitornoDate(date);
  };

  // Get minimum date for ritorno (should be after andata)
  const getRitornoMinDate = () => {
    return andataDate || new Date();
  };

  // Handle stop selection
  const handleFromStopSelect = (stop: Stop) => {
    setFromStop(stop);
    setShowFromStopError(false); // Clear error when stop is selected
    // If same stop is selected for destination, clear it
    if (toStop && toStop.id === stop.id) {
      setToStop(null);
    }
  };

  const handleToStopSelect = (stop: Stop) => {
    setToStop(stop);
    setShowToStopError(false); // Clear error when stop is selected
  };

  // Handle swapping stops
  const handleSwapStops = () => {
    if (fromStop && toStop) {
      // Swap the stops
      const tempStop = fromStop;
      setFromStop(toStop);
      setToStop(tempStop);
    }
  };

  // Helper function to format date as YYYY-MM-DD (local timezone)
  const formatDateForUrl = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle search button click
  const handleSearch = () => {
    if (isLoading) {
      return;
    }
    
    // Validate required fields
    let hasError = false;
    
    if (!fromStop) {
      setShowFromStopError(true);
      hasError = true;
    }
    
    if (!toStop) {
      setShowToStopError(true);
      hasError = true;
    }
    
    if (!andataDate) {
      setShowAndataError(true);
      hasError = true;
    }
    
    // If any validation failed, stop here
    if (hasError) {
      return;
    }
    
    // Build search parameters
    const searchParams = new URLSearchParams();
    
    if (fromStop) {
      searchParams.set('from', fromStop.id);
    }
    if (toStop) {
      searchParams.set('to', toStop.id);
    }
    if (andataDate) {
      // Use local date format (YYYY-MM-DD) to avoid timezone issues
      searchParams.set('andata', formatDateForUrl(andataDate));
    }
    if (ritornoDate) {
      // Use local date format (YYYY-MM-DD) to avoid timezone issues
      searchParams.set('ritorno', formatDateForUrl(ritornoDate));
    }
    
    // Navigate to search results page
    router.push(`/search-results?${searchParams.toString()}`);
  };

  // Show error state
  if (error) {
    return (
      <div className="search">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{error}</div>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Riprova
          </button>
        </div>
        <style jsx>{`
          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #ffffff;
            padding: 20px;
          }
          .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .error-text {
            font-family: "Inter-Medium", sans-serif;
            font-size: 14px;
            color: #666666;
            text-align: center;
            margin-bottom: 24px;
          }
          .retry-button {
            background: ${orangeGradient};
            border: none;
            border-radius: 12px;
            padding: 12px 24px;
            color: white;
            font-family: "Inter-SemiBold", sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: filter 0.2s;
          }
          .retry-button:hover {
            filter: brightness(0.95);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="search">
      {/* Logo Frame */}
      <div className="frame-1">
        <div className="logo-block">
          <Image
            src="/mobile/splash-logo.png"
            alt="Fracassa Autolinee"
            width={184}
            height={117}
            priority
            className="logo-image"
          />
        </div>
      </div>

      {/* Bottom line */}
      <Image className="vector-3" src="/mobile/search/vector-30.svg" alt="Bottom line" width={90} height={0} />

      {/* Main Search Form */}
      <div className="frame-38">
        <div className="frame-31">
          <div className="frame-10">
            {/* Main search container */}
            <div className={`rectangle-7 ${showFromStopError || showToStopError ? 'has-error' : ''}`}></div>
            
            {/* Labels */}
            <div className={`da ${showFromStopError ? 'label-error' : ''}`}>Da</div>
            <div className={`a ${showToStopError ? 'label-error' : ''}`}>A</div>
            
            {/* Input fields */}
            <div className={`frame-114 ${showFromStopError ? 'field-error' : ''}`} onClick={() => setIsFromStopModalOpen(true)}>
              <div className={`cerca ${fromStop ? 'selected' : ''}`}>
                {fromStop ? capitalizeWords(fromStop.name) : (showFromStopError ? 'Seleziona una fermata' : 'Cerca')}
              </div>
            </div>
            <div className={`frame-115 ${showToStopError ? 'field-error' : ''}`} onClick={() => setIsToStopModalOpen(true)}>
              <div className={`cerca2 ${toStop ? 'selected' : ''}`}>
                {toStop ? capitalizeWords(toStop.name) : (showToStopError ? 'Seleziona una fermata' : 'Cerca')}
              </div>
            </div>

            {/* Route indicators */}
            <div className="frame-7"></div>
            
            {/* Swap button container */}
            <div className="frame-113">
              <Image
                src="/mobile/search/frame-1120.svg"
                alt="Route"
                width={218}
                height={0}
                className="frame-112"
              />
              <Image
                src="/mobile/search/frame-90.svg"
                alt="Swap"
                width={39}
                height={42}
                className="frame-9"
                onClick={handleSwapStops}
              />
            </div>

            {/* Route indicators */}
            <div className="frame-147">
              <div className="ellipse-1"></div>
              <div className="ellipse-2"></div>
              <div className="ellipse-3"></div>
              <div className="ellipse-4"></div>
              <div className="ellipse-5"></div>
              <div className="ellipse-12"></div>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className={`frame-37 ${isLoading ? 'is-loading' : ''}`} onClick={handleSearch}>
          <div className="frame-17">
            <div className="frame-116">
              <div className="frame-35">
                <Image
                  src="/mobile/search/entypo-magnifying-glass0.svg"
                  alt="Search"
                  width={11}
                  height={11}
                  className="entypo-magnifying-glass"
                />
                <div className="cerca3">Cerca</div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Pickers */}
        <div className={`frame-30 ${showAndataError ? 'has-error' : ''}`} onClick={() => setIsAndataCalendarOpen(true)}>
          <div className="frame-109">
            <div className="frame-48">
              <div className="andata">Data</div>
            </div>
            <div className="frame-108">
              <div className="div">{formatDateDisplay(andataDate)}</div>
              <Image
                src="/mobile/search/vector-50.svg"
                alt="Dropdown"
                width={12.5}
                height={8}
                className="vector-5"
              />
            </div>
          </div>
        </div>

        {/* Error message for Andata date */}
        {showAndataError && (
          <div className="andata-error">
            Seleziona una data di andata
          </div>
        )}

        <div className="frame-32 disabled">
          <div className="frame-111">
            <div className="frame-47">
              <div className="ritorno">Ritorno</div>
            </div>
            <div className="frame-110">
              <div className="div">{formatDateDisplay(ritornoDate)}</div>
              <Image
                src="/mobile/search/vector-51.svg"
                alt="Dropdown"
                width={12.5}
                height={8}
                className="vector-52"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Icon */}
      <div className="frame-23" onClick={() => getAdminLoginPage()}>
        <svg
          className="admin-icon"
          viewBox="0 0 17 17"
          role="img"
          aria-label="Profilo amministratore"
        >
          <path
            d="M8.5 8.5C7.33125 8.5 6.33073 8.08385 5.49844 7.25156C4.66615 6.41927 4.25 5.41875 4.25 4.25C4.25 3.08125 4.66615 2.08073 5.49844 1.24844C6.33073 0.416146 7.33125 0 8.5 0C9.66875 0 10.6693 0.416146 11.5016 1.24844C12.3339 2.08073 12.75 3.08125 12.75 4.25C12.75 5.41875 12.3339 6.41927 11.5016 7.25156C10.6693 8.08385 9.66875 8.5 8.5 8.5ZM0 17V14.025C0 13.4229 0.155125 12.8697 0.465375 12.3654C0.775625 11.861 1.18717 11.4757 1.7 11.2094C2.79792 10.6604 3.91354 10.2489 5.04687 9.97475C6.18021 9.70062 7.33125 9.56321 8.5 9.5625C9.66875 9.56179 10.8198 9.69921 11.9531 9.97475C13.0865 10.2503 14.2021 10.6618 15.3 11.2094C15.8135 11.475 16.2254 11.8603 16.5357 12.3654C16.8459 12.8704 17.0007 13.4236 17 14.025V17H0ZM2.125 14.875H14.875V14.025C14.875 13.8302 14.8265 13.6531 14.7294 13.4938C14.6324 13.3344 14.5038 13.2104 14.3437 13.1219C13.3875 12.6438 12.4224 12.2853 11.4484 12.0466C10.4745 11.8079 9.49167 11.6882 8.5 11.6875C7.50833 11.6868 6.52552 11.8065 5.55156 12.0466C4.5776 12.2867 3.6125 12.6452 2.65625 13.1219C2.49687 13.2104 2.36831 13.3344 2.27056 13.4938C2.17281 13.6531 2.12429 13.8302 2.125 14.025V14.875ZM8.5 6.375C9.08437 6.375 9.58481 6.1671 10.0013 5.75131C10.4178 5.33552 10.6257 4.83508 10.625 4.25C10.6243 3.66492 10.4164 3.16483 10.0013 2.74975C9.58623 2.33467 9.08579 2.12642 8.5 2.125C7.91421 2.12358 7.41412 2.33183 6.99975 2.74975C6.58537 3.16767 6.37712 3.66775 6.375 4.25C6.37287 4.83225 6.58112 5.33269 6.99975 5.75131C7.41837 6.16994 7.91846 6.37783 8.5 6.375Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Calendar Components */}
      <Calendar
        isOpen={isAndataCalendarOpen}
        onClose={() => setIsAndataCalendarOpen(false)}
        onDateSelect={handleAndataDateSelect}
        selectedDate={andataDate || undefined}
        minDate={new Date()}
      />

      <Calendar
        isOpen={isRitornoCalendarOpen}
        onClose={() => setIsRitornoCalendarOpen(false)}
        onDateSelect={handleRitornoDateSelect}
        selectedDate={ritornoDate || undefined}
        minDate={getRitornoMinDate()}
      />

      {/* Stops Modal Components */}
      <StopsModal
        isOpen={isFromStopModalOpen}
        onClose={() => setIsFromStopModalOpen(false)}
        onStopSelect={handleFromStopSelect}
        selectedStop={fromStop || undefined}
        title="Seleziona partenza"
        stops={stops}
      />

      <StopsModal
        isOpen={isToStopModalOpen}
        onClose={() => setIsToStopModalOpen(false)}
        onStopSelect={handleToStopSelect}
        selectedStop={toStop || undefined}
        title="Seleziona destinazione"
        stops={stops}
      />


      <style jsx>{`
        .search,
        .search * {
          box-sizing: border-box;
        }
        .search {
          background: #ffffff;
          height: 852px;
          position: relative;
          overflow: hidden;
        }
        .frame-1 {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          position: absolute;
          left: 0px;
          top: 55px;
        }
        .logo-block {
          width: 184px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        .logo-image {
          width: 100%;
          height: 117px;
          object-fit: contain;
        }
        .vector-3 {
          width: 90px;
          height: 0px;
          position: absolute;
          left: 151px;
          top: 844px;
          overflow: visible;
        }
        .frame-38 {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          justify-content: flex-start;
          width: 334px;
          position: absolute;
          left: 29px;
          top: 240px;
        }
        .frame-31 {
          align-self: stretch;
          flex-shrink: 0;
          height: 122px;
          position: relative;
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
          transition: border-color 0.2s, border-width 0.2s;
        }
        .rectangle-7.has-error {
          border-color: #f40101;
          border-width: 2px;
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
          transition: color 0.2s;
        }
        .da.label-error {
          color: #f40101;
        }
        .a {
          color: #d6d8dc;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: absolute;
          left: 46px;
          top: 71px;
          transition: color 0.2s;
        }
        .a.label-error {
          color: #f40101;
        }
        .frame-114 {
          padding: 10px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          height: 32px;
          width: 250px;
          position: absolute;
          left: 36px;
          top: 30px;
          cursor: pointer;
          transition: background-color 0.2s;
          border-radius: 8px;
          z-index: 10;
        }

        .frame-114:hover {
          background: rgba(244, 148, 1, 0.1);
        }
        .frame-114.field-error {
          background: rgba(244, 1, 1, 0.05);
        }
        .frame-114.field-error .cerca {
          color: #f40101;
        }
        .cerca {
          color: rgba(151, 151, 164, 0.3);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
        }

        .cerca.selected {
          color: #9797a4;
        }
        .frame-115 {
          padding: 10px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          height: 32px;
          width: 250px;
          position: absolute;
          left: 38px;
          top: 78px;
          cursor: pointer;
          transition: background-color 0.2s;
          border-radius: 8px;
          z-index: 10;
        }

        .frame-115:hover {
          background: rgba(244, 148, 1, 0.1);
        }
        .frame-115.field-error {
          background: rgba(244, 1, 1, 0.05);
        }
        .frame-115.field-error .cerca2 {
          color: #f40101;
        }
          /* TO DO: check if this is correct and Cerca  */
        .cerca2 {
          color: rgba(151, 151, 164, 0.3);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
        }

        .cerca2.selected {
          color: #9797a4;
        }
        .frame-7 {
          width: 15px;
          height: 15px;
          position: absolute;
          left: 16px;
          top: 18px;
        }
        .frame-113 {
          display: flex;
          flex-direction: row;
          gap: 22px;
          align-items: center;
          justify-content: center;
          position: absolute;
          left: 36px;
          top: 41px;
        }
        .frame-112 {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          justify-content: flex-start;
          flex-shrink: 0;
          width: 218px;
          height: auto;
          position: relative;
          overflow: visible;
          pointer-events: none;
        }
        .frame-9 {
          flex-shrink: 0;
          width: 39px;
          height: 42px;
          position: relative;
          overflow: visible;
          pointer-events: auto;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .frame-9:hover {
          transform: scale(1.05);
        }

        .frame-9:active {
          transform: scale(0.95);
        }
        .frame-147,
        .frame-147 * {
          box-sizing: border-box;
        }
        .frame-147 {
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
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
        .ellipse-2,
        .ellipse-3,
        .ellipse-4,
        .ellipse-5 {
          background: #d9d9d9;
          border-radius: 50%;
          flex-shrink: 0;
          width: 3.67px;
          height: 3.67px;
          position: relative;
        }
        .ellipse-12 {
          background: rgba(244, 1, 1, 0.41);
          border-radius: 50%;
          border-style: solid;
          border-color: #f40101;
          border-width: 2.73px;
          align-self: stretch;
          flex-shrink: 0;
          height: 15px;
          position: relative;
        }
        .frame-37 {
          background: ${orangeGradient};
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 15px 27px 15px 27px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 109px;
          height: 47px;
          position: absolute;
          left: 113px;
          top: 209px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: filter 0.2s;
        }

        .frame-37.is-loading {
          opacity: 0.6;
          pointer-events: none;
          cursor: wait;
        }

        .frame-37:hover {
          filter: brightness(0.95);
        }
        .frame-17 {
          display: flex;
          flex-direction: row;
          gap: 1px;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          position: relative;
        }
        .frame-116 {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          justify-content: flex-start;
          flex-shrink: 0;
          width: 54px;
          position: relative;
        }
        .frame-35 {
          display: flex;
          flex-direction: row;
          gap: 4px;
          align-items: center;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
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
        .cerca3 {
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
          flex-shrink: 0;
          width: 165px;
          height: 51px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 136px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .frame-30:hover {
          background: rgba(255, 254, 254, 0.8);
        }
        .frame-30.has-error {
          border-color: #f40101;
          border-width: 2px;
        }
        .andata-error {
          color: #f40101;
          font-family: "Inter-Medium", sans-serif;
          font-size: 11px;
          font-weight: 500;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 192px;
          text-align: center;
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .frame-109 {
          display: flex;
          flex-direction: column;
          gap: 0px;
          align-items: flex-start;
          justify-content: flex-start;
          width: 96.5px;
          position: absolute;
          left: 61px;
          top: 4px;
        }
        .frame-48 {
          display: flex;
          flex-direction: column;
          gap: 0px;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          width: 42px;
          position: relative;
        }
        .andata {
          color: #d6d8dc;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: relative;
          align-self: stretch;
        }
        .frame-108 {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
        }
        .div {
          color: rgba(151, 151, 164, 0.8);
          text-align: center;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: relative;
          width: 42px;
        }
        .vector-5 {
          flex-shrink: 0;
          width: 12.5px;
          height: 8px;
          position: relative;
          overflow: visible;
        }
        .frame-32 {
          background: rgba(255, 254, 254, 0.6);
          border-radius: 16px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.17);
          border-width: 1px;
          padding: 4px 55px 4px 55px;
          flex-shrink: 0;
          width: 165px;
          height: 51px;
          position: absolute;
          left: 169px;
          top: 136px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: background-color 0.2s;
          display: none;
        }

        .frame-32.disabled {
          opacity: 0.4;
          pointer-events: none;
          cursor: not-allowed;
        }

        .frame-32:hover:not(.disabled) {
          background: rgba(255, 254, 254, 0.8);
        }
        .frame-111 {
          display: flex;
          flex-direction: column;
          gap: 0px;
          align-items: flex-start;
          justify-content: flex-start;
          width: 95.5px;
          position: absolute;
          left: 62px;
          top: 4px;
        }
        .frame-47 {
          display: flex;
          flex-direction: column;
          gap: 0px;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          width: 42px;
          position: relative;
        }
        .ritorno {
          color: #d6d8dc;
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          position: relative;
          align-self: stretch;
        }
        .frame-110 {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
        }
        .vector-52 {
          flex-shrink: 0;
          width: 12.5px;
          height: 8px;
          position: relative;
          overflow: visible;
        }
        .frame-23 {
          position: absolute;
          right: 24px;
          bottom: 32px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .admin-icon {
          width: 18px;
          height: 18px;
          color: rgba(139, 139, 152, 0.28);
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .frame-23:active .admin-icon,
        .frame-23:focus-visible .admin-icon {
          color: #f49401;
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}

/**
 * Loading fallback component for Suspense
 */
function SearchLoading() {
  return (
    <div className="search">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Caricamento...</div>
      </div>
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #ffffff;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid rgba(255, 169, 37, 1);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        .loading-text {
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          color: #666666;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Search Screen - Based on autohtml-project design
 * Implements the exact design from the HTML/CSS files
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
