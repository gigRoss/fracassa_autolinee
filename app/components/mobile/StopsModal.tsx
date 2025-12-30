'use client';

import { useState } from 'react';

interface Stop {
  id: string;
  name: string;
  city: string;
}

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

interface StopsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStopSelect: (stop: Stop) => void;
  selectedStop?: Stop;
  title: string;
  stops: Stop[];
}

export default function StopsModal({
  isOpen,
  onClose,
  onStopSelect,
  selectedStop,
  title,
  stops
}: StopsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Remove duplicates by ID (keep only the first occurrence)
  const uniqueStops = stops.filter((stop, index, self) =>
    index === self.findIndex((s) => s.id === stop.id)
  );

  // Filter stops based on search term
  const filteredStops = uniqueStops.filter(stop =>
    stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stop.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStopClick = (stop: Stop) => {
    onStopSelect(stop);
    onClose();
  };

  return (
    <div className="stops-modal-overlay">
      <div className="stops-modal-container">
        {/* Header */}
        <div className="stops-modal-header">
          <h3 className="stops-modal-title">{title}</h3>
          <button className="stops-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div className="stops-modal-search">
          <input
            type="text"
            placeholder="Cerca fermata..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="stops-modal-search-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode="search"
            autoFocus
          />
        </div>

        {/* Stops List */}
        <div className="stops-modal-list">
          {filteredStops.length > 0 ? (
            filteredStops.map((stop) => (
              <button
                key={stop.id}
                className={`stops-modal-item ${selectedStop?.id === stop.id ? 'selected' : ''}`}
                onClick={() => handleStopClick(stop)}
              >
                <div className="stops-modal-item-content">
                  <div className="stops-modal-item-name">{capitalizeWords(stop.name)}</div>
                  {stop.city && stop.city.toLowerCase() !== stop.name.toLowerCase() && (
                    <div className="stops-modal-item-city">{capitalizeWords(stop.city)}</div>
                  )}
                </div>
                {selectedStop?.id === stop.id && (
                  <div className="stops-modal-item-check">✓</div>
                )}
              </button>
            ))
          ) : (
            <div className="stops-modal-empty">
              Nessuna fermata trovata
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="stops-modal-footer">
          <button className="stops-modal-cancel-btn" onClick={onClose}>
            Annulla
          </button>
        </div>
      </div>

      <style jsx>{`
        .stops-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .stops-modal-container {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 400px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.3);
        }

        .stops-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 0 20px;
          border-bottom: 1px solid #e5e5e5;
          margin-bottom: 20px;
        }

        .stops-modal-title {
          font-family: "Inter-SemiBold", sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #333333;
          margin: 0;
        }

        .stops-modal-close-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: #666666;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .stops-modal-close-btn:hover {
          background: #f0f0f0;
        }

        .stops-modal-search {
          padding: 0 20px 20px 20px;
        }

        .stops-modal-search-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          color: #333333;
          background: #fafafa;
          transition: border-color 0.2s;
        }

        .stops-modal-search-input:focus {
          outline: none;
          border-color: rgba(244, 148, 1, 1);
          background: #ffffff;
        }

        .stops-modal-search-input::placeholder {
          color: #999999;
        }

        .stops-modal-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 20px;
          max-height: 300px;
        }

        .stops-modal-item {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid #f0f0f0;
          padding: 16px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background-color 0.2s;
          text-align: left;
        }

        .stops-modal-item:hover {
          background: #f8f8f8;
        }

        .stops-modal-item.selected {
          background: #fff4e6;
        }

        .stops-modal-item-content {
          flex: 1;
        }

        .stops-modal-item-name {
          font-family: "Inter-SemiBold", sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #9797a4;
          margin-bottom: 2px;
        }

        .stops-modal-item-city {
          font-family: "Inter-Medium", sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: rgba(151, 151, 164, 0.8);
        }

        .stops-modal-item-check {
          color: rgba(244, 148, 1, 1);
          font-size: 16px;
          font-weight: bold;
        }

        .stops-modal-empty {
          text-align: center;
          padding: 40px 20px;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          color: #999999;
        }

        .stops-modal-footer {
          padding: 20px;
          border-top: 1px solid #e5e5e5;
        }

        .stops-modal-cancel-btn {
          width: 100%;
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

        .stops-modal-cancel-btn:hover {
          filter: brightness(0.95);
        }
      `}</style>
    </div>
  );
}
