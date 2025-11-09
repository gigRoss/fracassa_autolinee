'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Force dynamic rendering since this page uses client-side navigation
export const dynamic = 'force-dynamic';

/**
 * Splash Screen - Shows for 2 seconds on app launch
 * Displays Fracassa Autolinee logo centered
 * Automatically transitions to Homepage after 2s
 */
export default function SplashScreen() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Wait for 2 seconds, then start exit animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2000);

    // After exit animation completes, navigate directly to search
    const navigateTimer = setTimeout(() => {
      router.push('/search');
    }, 2300); // 2000ms wait + 300ms fade out

    // Cleanup timers on unmount
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navigateTimer);
    };
  }, [router]);

  return (
    <div
      className={`
        relative
        w-full max-w-[393px] mx-auto
        h-screen
        bg-white
        flex
        items-center
        justify-center
        ${isExiting ? 'animate-splash-fade-out' : ''}
      `}
      role="main"
      aria-label="Schermata di avvio"
    >
      <div
        className="animate-splash-entry"
        style={{
          width: '184px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <Image
          src="/mobile/splash-logo.png"
          alt="Fracassa Autolinee logo"
          width={184}
          height={117}
          priority
          style={{
            width: '100%',
            height: '117px',
            objectFit: 'contain',
          }}
        />
      </div>
      
      {/* Accessibility: Announce loading state to screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        Caricamento dell&apos;applicazione Fracassa Autolinee
      </div>
    </div>
  );
}
