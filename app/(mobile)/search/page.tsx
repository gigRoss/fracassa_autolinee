'use client';

import Image from 'next/image';
import { useState } from 'react';
import Calendar from '../../components/mobile/Calendar';
import StopsModal from '../../components/mobile/StopsModal';
import { stops } from '../../lib/data';

/**
 * Search Screen - Based on autohtml-project design
 * Implements the exact design from the HTML/CSS files
 */
export default function SearchPage() {
  // State for date selection
  const [andataDate, setAndataDate] = useState<Date | null>(null);
  const [ritornoDate, setRitornoDate] = useState<Date | null>(null);
  const [isAndataCalendarOpen, setIsAndataCalendarOpen] = useState(false);
  const [isRitornoCalendarOpen, setIsRitornoCalendarOpen] = useState(false);

  // State for stops selection
  const [fromStop, setFromStop] = useState<typeof stops[0] | null>(null);
  const [toStop, setToStop] = useState<typeof stops[0] | null>(null);
  const [isFromStopModalOpen, setIsFromStopModalOpen] = useState(false);
  const [isToStopModalOpen, setIsToStopModalOpen] = useState(false);

  // Format date for display
  const formatDateDisplay = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Handle date selection
  const handleAndataDateSelect = (date: Date) => {
    setAndataDate(date);
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
  const handleFromStopSelect = (stop: typeof stops[0]) => {
    setFromStop(stop);
    // If same stop is selected for destination, clear it
    if (toStop && toStop.id === stop.id) {
      setToStop(null);
    }
  };

  const handleToStopSelect = (stop: typeof stops[0]) => {
    setToStop(stop);
  };

  return (
    <div className="search">
      {/* Logo Frame */}
      <div className="frame-1">
        <Image
          src="/mobile/splash-logo.png"
          alt="Fracassa Autolinee"
          width={209}
          height={209}
          priority
          className="_305757967-504591061673203-1893046267709735490-n-1"
        />
      </div>

      {/* Bottom line */}
      <Image className="vector-3" src="/mobile/search/vector-30.svg" alt="Bottom line" width={90} height={0} />

      {/* Main Search Form */}
      <div className="frame-38">
        <div className="frame-31">
          <div className="frame-10">
            {/* Main search container */}
            <div className="rectangle-7"></div>
            
            {/* Labels */}
            <div className="da">Da</div>
            <div className="a">A</div>
            
            {/* Input fields */}
            <div className="frame-114" onClick={() => setIsFromStopModalOpen(true)}>
              <div className={`cerca ${fromStop ? 'selected' : ''}`}>{fromStop ? `${fromStop.name}, ${fromStop.city}` : 'Cerca'}</div>
            </div>
            <div className="frame-115" onClick={() => setIsToStopModalOpen(true)}>
              <div className={`cerca2 ${toStop ? 'selected' : ''}`}>{toStop ? `${toStop.name}, ${toStop.city}` : 'Cerca'}</div>
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
              />
            </div>

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
        <div className="frame-30" onClick={() => setIsAndataCalendarOpen(true)}>
          <div className="frame-109">
            <div className="frame-48">
              <div className="andata">Andata</div>
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

        <div className="frame-32" onClick={() => setIsRitornoCalendarOpen(true)}>
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
      <div className="frame-23">
        <Image
          src="/mobile/search/material-symbols-person-outline0.svg"
          alt="Profile"
          width={17}
          height={17}
          className="material-symbols-person-outline"
        />
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
          background: #ffffff;
          border-radius: 61px;
          padding: 6px 74px 6px 74px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          width: 357px;
          height: 222px;
          position: absolute;
          left: 18px;
          top: 55px;
        }
        ._305757967-504591061673203-1893046267709735490-n-1 {
          flex-shrink: 0;
          width: 209px;
          height: 209px;
          position: relative;
          object-fit: cover;
          aspect-ratio: 1;
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
          top: 254px;
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
        .cerca {
          color: rgba(151, 151, 164, 0.3);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
        }

        .cerca.selected {
          color: #333333;
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
        .cerca2 {
          color: rgba(139, 139, 152, 0.3);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
        }

        .cerca2.selected {
          color: #333333;
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
          background: #f49401;
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
          left: 0px;
          top: 136px;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .frame-30:hover {
          background: rgba(255, 254, 254, 0.8);
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
          color: #333333;
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
        }

        .frame-32:hover {
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
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: center;
          justify-content: center;
          width: 17px;
          height: 11px;
          position: absolute;
          left: 354px;
          top: 806px;
        }
        .material-symbols-person-outline {
          align-self: stretch;
          flex-shrink: 0;
          height: 17px;
          position: relative;
          overflow: visible;
          aspect-ratio: 1;
        }
      `}</style>
    </div>
  );
}
