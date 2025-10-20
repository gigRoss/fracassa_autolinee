'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNav from '@/app/components/mobile/BottomNav';

interface SearchFormData {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
}

interface FormErrors {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
}

interface Stop {
  id: string;
  name: string;
  city: string;
}

/**
 * Search Screen - Exact Figma CSS implementation
 * Matches the provided CSS specifications exactly
 */
export default function SearchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [stops, setStops] = useState<Stop[]>([]);
  const [loadingStops, setLoadingStops] = useState(true);
  const [formData, setFormData] = useState<SearchFormData>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
  });

  // Fetch stops on mount
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const response = await fetch('/stops');
        if (response.ok) {
          const data = await response.json();
          setStops(data);
        }
      } catch (error) {
        console.error('Error fetching stops:', error);
      } finally {
        setLoadingStops(false);
      }
    };

    fetchStops();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.origin.trim()) {
      newErrors.origin = 'Seleziona una fermata di partenza';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Seleziona una fermata di arrivo';
    }

    if (!formData.departureDate) {
      newErrors.departureDate = 'Seleziona una data';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Find stop IDs from the text inputs
      const originStop = stops.find(
        s => `${s.name} (${s.city})` === formData.origin || s.name === formData.origin
      );
      const destStop = stops.find(
        s => `${s.name} (${s.city})` === formData.destination || s.name === formData.destination
      );

      if (!originStop || !destStop) {
        throw new Error('Seleziona fermate valide dall\'elenco');
      }

      const queryParams = new URLSearchParams({
        origin: originStop.id,
        destination: destStop.id,
        date: formData.departureDate,
      });

      const response = await fetch(`/api/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      router.push(
        `/results?origin=${encodeURIComponent(originStop.id)}&destination=${encodeURIComponent(destStop.id)}&date=${encodeURIComponent(formData.departureDate)}`
      );
    } catch (error) {
      console.error('Search error:', error);
      setErrors({ 
        origin: error instanceof Error ? error.message : 'Si è verificato un errore. Riprova.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SearchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSwap = () => {
    setFormData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  return (
    <div 
      className="relative mx-auto bg-white"
      style={{ width: '393px', height: '852px' }}
    >
      {/* Logo Container - Centered at top */}
      <div 
        className="absolute flex justify-center"
        style={{ width: '393px', height: '140px', left: '0px', top: '30px' }}
      >
        <Image
          src="/mobile/splash-logo.png"
          alt="Fracassa Autolinee"
          width={150}
          height={1500}
          priority
          className="object-contain"
        />
      </div>

      {/* Search Form Container */}
      <form 
        onSubmit={handleSubmit}
        className="absolute"
        style={{ width: '350px', height: '300px', left: '21px', top: '200px' }}
      >
        {/* Main Search Form - White background with shadow */}
        <div 
          className="absolute bg-white rounded-2xl shadow-lg"
          style={{ 
            width: '350px', 
            height: '170px', 
            left: '0px', 
            top: '0px',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Origin/Destination Input Fields */}
          <div className="flex flex-col p-4 gap-4">
            {/* Origin Field */}
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full border-2"
                style={{ 
                  background: 'rgba(22, 208, 32, 0.37)',
                  borderColor: '#16D020'
                }}
              />
              <div className="flex flex-col flex-1">
                <span className="text-xs text-gray-400 font-medium">Da</span>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  placeholder="Cerca"
                  disabled={loadingStops}
                  list="origin-stops"
                  className="bg-transparent border-none outline-none text-sm font-medium text-gray-600 placeholder-gray-300"
                />
                <div className="w-full h-px bg-gray-200 mt-1" />
              </div>
            </div>

            {/* Destination Field */}
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full border-2"
                style={{ 
                  background: 'rgba(244, 1, 1, 0.41)',
                  borderColor: '#F40101'
                }}
              />
              <div className="flex flex-col flex-1">
                <span className="text-xs text-gray-400 font-medium">A</span>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  placeholder="Cerca"
                  disabled={loadingStops}
                  list="destination-stops"
                  className="bg-transparent border-none outline-none text-sm font-medium text-gray-600 placeholder-gray-300"
                />
              </div>
            </div>
            
            {/* Swap Button - Positioned on the right */}
            <div className="absolute flex justify-end items-center" style={{ top: '50%', right: '16px', transform: 'translateY(-50%)' }}>
              <button
                type="button"
                onClick={handleSwap}
                className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
                aria-label="Scambia partenza e destinazione"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  {/* Freccia verso l'alto */}
                  <path d="M8 2L11 5H5L8 2Z" fill="#9797A4"/>
                  {/* Freccia verso il basso */}
                  <path d="M8 14L5 11H11L8 14Z" fill="#9797A4"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Date Pickers */}
        <div className="absolute flex gap-4" style={{ top: '180px', left: '0px' }}>
          {/* Departure Date */}
          <div 
            className="bg-white rounded-2xl shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ 
              width: '165px', 
              height: '51px',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
            }}
          >
            <label 
              htmlFor="departure-date"
              className="flex flex-col items-center justify-center h-full cursor-pointer"
            >
              <span className="text-xs text-gray-400 font-medium">Andata</span>
              <span className="text-xs text-gray-400 font-medium">
                {formData.departureDate ? new Date(formData.departureDate + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : '-'}
              </span>
            </label>
            <input
              id="departure-date"
              type="date"
              value={formData.departureDate}
              onChange={(e) => handleInputChange('departureDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="absolute opacity-0 cursor-pointer"
              style={{ inset: 0, width: '100%', height: '100%' }}
            />
            <svg 
              className="absolute pointer-events-none" 
              style={{ width: '12px', height: '8px', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
              viewBox="0 0 13 8" 
              fill="none"
            >
              <path d="M1 1L6.5 6.5L12 1" stroke="#D6D8DC" strokeWidth="1" />
            </svg>
          </div>

          {/* Return Date */}
          <div 
            className="bg-white rounded-2xl shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ 
              width: '165px', 
              height: '51px',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
            }}
          >
            <label 
              htmlFor="return-date"
              className="flex flex-col items-center justify-center h-full cursor-pointer"
            >
              <span className="text-xs text-gray-400 font-medium">Ritorno</span>
              <span className="text-xs text-gray-400 font-medium">
                {formData.returnDate ? new Date(formData.returnDate + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : '-'}
              </span>
            </label>
            <input
              id="return-date"
              type="date"
              value={formData.returnDate}
              onChange={(e) => handleInputChange('returnDate', e.target.value)}
              min={formData.departureDate || new Date().toISOString().split('T')[0]}
              className="absolute opacity-0 cursor-pointer"
              style={{ inset: 0, width: '100%', height: '100%' }}
            />
            <svg 
              className="absolute pointer-events-none" 
              style={{ width: '12px', height: '8px', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
              viewBox="0 0 13 8" 
              fill="none"
            >
              <path d="M1 1L6.5 6.5L12 1" stroke="#D6D8DC" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading || loadingStops}
          className="absolute bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 rounded-2xl shadow-lg flex items-center justify-center gap-2"
          style={{ 
            width: '109px', 
            height: '47px', 
            left: '120px', 
            top: '250px',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
          }}
        >
          <svg 
            width="10" 
            height="10" 
            viewBox="0 0 10 10" 
            fill="none"
          >
            <path d="M6.5 6.5L9 9M3.5 7.5C1.567 7.5 0 5.933 0 4C0 2.067 1.567 0.5 3.5 0.5C5.433 0.5 7 2.067 7 4C7 5.933 5.433 7.5 3.5 7.5Z" stroke="#FFFFFF" strokeWidth="1"/>
          </svg>
          <span className="text-white font-semibold text-sm">
            {loading ? '...' : 'Cerca'}
          </span>
        </button>

        {/* Datalists for autocomplete */}
        <datalist id="origin-stops">
          {stops.map((stop) => (
            <option key={stop.id} value={`${stop.name} (${stop.city})`} />
          ))}
        </datalist>
        <datalist id="destination-stops">
          {stops.map((stop) => (
            <option key={stop.id} value={`${stop.name} (${stop.city})`} />
          ))}
        </datalist>
      </form>

      {/* Bottom Navigation */}
      {/* <BottomNav /> */}
    </div>
  );
}
