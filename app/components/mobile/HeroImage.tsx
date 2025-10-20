'use client';

import Image from 'next/image';
import { useState } from 'react';

interface HeroImageProps {
  variant?: 'full' | 'compact';
  priority?: boolean;
  className?: string;
}

/**
 * Hero image component for branding at top of screens
 * Full variant: Homepage (y: 129px)
 * Compact variant: Search screen (y: 50px)
 */
export default function HeroImage({ 
  variant = 'full', 
  priority = false,
  className = ''
}: HeroImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Position based on variant
  const topPosition = variant === 'full' ? 'top-[129px]' : 'top-[50px]';

  return (
    <div 
      className={`
        absolute left-[18px]
        ${topPosition}
        w-[357px] h-[222px]
        ${className}
      `}
    >
      {/* Loading skeleton */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}

      {/* Error fallback */}
      {imageError && (
        <div className="absolute inset-0 bg-[#162686] flex items-center justify-center rounded-lg">
          <div className="text-white text-center p-4">
            <svg
              className="w-16 h-16 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Immagine non disponibile</p>
          </div>
        </div>
      )}

      {/* Hero image */}
      <div className={`relative w-full h-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Image
          src="/mobile/splash-logo.png"
          alt="Fracassa Autolinee - Servizio autobus"
          fill
          priority={priority}
          className="object-cover"
          sizes="357px"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
      </div>
    </div>
  );
}

