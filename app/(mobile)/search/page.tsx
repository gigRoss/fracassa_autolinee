'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import HeroImage from '@/app/components/mobile/HeroImage';
import SearchButton from '@/app/components/mobile/SearchButton';
import InputField from '@/app/components/mobile/InputField';
import BottomNav from '@/app/components/mobile/BottomNav';

interface SearchFormData {
  origin: string;
  destination: string;
  date: string;
}

interface FormErrors {
  origin?: string;
  destination?: string;
  date?: string;
}

/**
 * Search Screen - Search form for routes
 * Features:
 * - Hero image (compact position)
 * - Search form with 3 fields (origin, destination, date)
 * - Blue overlay container
 * - Search button
 * - Bottom navigation
 */
export default function SearchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<SearchFormData>({
    origin: '',
    destination: '',
    date: '',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.origin.trim()) {
      newErrors.origin = 'Seleziona una fermata di partenza';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Seleziona una fermata di arrivo';
    }

    if (!formData.date) {
      newErrors.date = 'Seleziona una data';
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
      // TODO: Call API to search for routes
      // const results = await searchRoutes(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Navigate to results or update UI with results
      console.log('Searching for routes:', formData);
      
      // Example: router.push(`/results?origin=${formData.origin}&destination=${formData.destination}&date=${formData.date}`);
    } catch (error) {
      console.error('Search error:', error);
      setErrors({ origin: 'Si è verificato un errore. Riprova.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SearchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Hero Image - compact position (top: 50px) */}
      <HeroImage variant="compact" />

      {/* Main Content Area */}
      <main className="relative pt-[290px] pb-[80px] px-[18px]">
        {/* Search Form Container - Blue Overlay */}
        <div
          className="
            relative
            w-full max-w-[357px] mx-auto
            min-h-[395px]
            p-6
            bg-[rgba(22,38,133,0.41)]
            border border-black
            shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
            rounded-lg
          "
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form Fields with staggered animation */}
            <div className="space-y-6">
              <div className="animate-field-1">
                <InputField
                  id="origin"
                  type="text"
                  label="Partenza"
                  placeholder="Seleziona fermata di partenza"
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  error={errors.origin}
                  required
                  autoFocus
                />
              </div>

              <div className="animate-field-2">
                <InputField
                  id="destination"
                  type="text"
                  label="Arrivo"
                  placeholder="Seleziona fermata di arrivo"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  error={errors.destination}
                  required
                />
              </div>

              <div className="animate-field-3">
                <InputField
                  id="date"
                  type="date"
                  label="Data"
                  placeholder="Seleziona data"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  error={errors.date}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Search Button - centered below form */}
            <div className="flex justify-center pt-4">
              <SearchButton
                type="submit"
                loading={loading}
                disabled={loading}
                aria-label={loading ? "Ricerca in corso..." : "Cerca corse"}
              />
            </div>
          </form>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

