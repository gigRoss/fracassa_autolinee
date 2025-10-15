'use client';

import { useRouter } from 'next/navigation';
import HeroImage from '@/app/components/mobile/HeroImage';
import SearchButton from '@/app/components/mobile/SearchButton';
import BottomNav from '@/app/components/mobile/BottomNav';

/**
 * Homepage - Main landing screen after splash
 * Features:
 * - Hero image at top
 * - Centered search button (primary CTA)
 * - Bottom navigation bar
 */
export default function HomePage() {
  const router = useRouter();

  const handleSearchClick = () => {
    // Navigate to search screen
    router.push('/search');
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Hero Image - positioned at top */}
      <HeroImage variant="full" priority />

      {/* Main Content Area */}
      <main className="relative pt-[370px] pb-[80px] px-[18px]">
        {/* Search Button - centered */}
        <div className="flex justify-center">
          <SearchButton
            onClick={handleSearchClick}
            aria-label="Cerca orari e corse"
          />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

