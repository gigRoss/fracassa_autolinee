'use client';

import { useState } from 'react';

interface CalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}

export default function Calendar({
  isOpen,
  onClose,
  onDateSelect,
  selectedDate,
  minDate = new Date(),
  maxDate
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  if (!isOpen) return null;

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Month names in Italian
  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  // Day names in Italian
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    
    // Check if date is valid (not in the past, within max date)
    if (clickedDate < minDate || (maxDate && clickedDate > maxDate)) {
      return;
    }

    onDateSelect(clickedDate);
    onClose();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    const dateToCheck = new Date(year, month, day);
    return dateToCheck.toDateString() === selectedDate.toDateString();
  };

  const isDateDisabled = (day: number) => {
    const dateToCheck = new Date(year, month, day);
    return dateToCheck < minDate || (maxDate && dateToCheck > maxDate);
  };

  const isToday = (day: number) => {
    const dateToCheck = new Date(year, month, day);
    return dateToCheck.toDateString() === today.toDateString();
  };

  return (
    <div className="calendar-overlay">
      <div className="calendar-container">
        {/* Header */}
        <div className="calendar-header">
          <button 
            className="calendar-nav-btn" 
            onClick={goToPreviousMonth}
            disabled={month === minDate.getMonth() && year === minDate.getFullYear()}
          >
            ‹
          </button>
          <h3 className="calendar-title">
            {monthNames[month]} {year}
          </h3>
          <button 
            className="calendar-nav-btn" 
            onClick={goToNextMonth}
            disabled={maxDate && month === maxDate.getMonth() && year === maxDate.getFullYear()}
          >
            ›
          </button>
        </div>

        {/* Day names */}
        <div className="calendar-days-header">
          {dayNames.map((day) => (
            <div key={day} className="calendar-day-name">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="calendar-grid">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="calendar-day-empty"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isSelected = isDateSelected(day);
            const isDisabled = isDateDisabled(day);
            const isTodayDate = isToday(day);

            return (
              <button
                key={day}
                className={`calendar-day ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isTodayDate ? 'today' : ''}`}
                onClick={() => handleDateClick(day)}
                disabled={isDisabled}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="calendar-footer">
          <button className="calendar-close-btn" onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>

      <style jsx>{`
        .calendar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9998;
          padding: 20px;
        }

        .calendar-container {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 320px;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .calendar-nav-btn {
          background: var(--mobile-orange-gradient, linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%));
          border: none;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: filter 0.2s;
        }

        .calendar-nav-btn:hover:not(:disabled) {
          filter: brightness(0.95);
        }

        .calendar-nav-btn:disabled {
          background: #d9d9d9;
          cursor: not-allowed;
        }

        .calendar-title {
          font-family: "Inter-SemiBold", sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #333333;
          margin: 0;
        }

        .calendar-days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 12px;
        }

        .calendar-day-name {
          text-align: center;
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: #666666;
          padding: 8px 0;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 20px;
        }

        .calendar-day-empty {
          height: 40px;
        }

        .calendar-day {
          background: transparent;
          border: none;
          border-radius: 8px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #333333;
          cursor: pointer;
          transition: all 0.2s;
        }

        .calendar-day:hover:not(:disabled) {
          background: #f0f0f0;
        }

        .calendar-day.today {
          background: #e3f2fd;
          color: #1976d2;
          font-weight: 600;
        }

        .calendar-day.selected {
          background: var(--mobile-orange-gradient, linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%));
          color: white;
          font-weight: 600;
        }

        .calendar-day.disabled {
          color: #d9d9d9;
          cursor: not-allowed;
        }

        .calendar-day.disabled:hover {
          background: transparent;
        }

        .calendar-footer {
          display: flex;
          justify-content: center;
        }

        .calendar-close-btn {
          background: var(--mobile-orange-gradient, linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%));
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

        .calendar-close-btn:hover {
          filter: brightness(0.95);
        }
      `}</style>
    </div>
  );
}
