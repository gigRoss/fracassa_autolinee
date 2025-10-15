'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

    // After exit animation completes, navigate to homepage
    const navigateTimer = setTimeout(() => {
      router.push('/home');
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
        min-h-screen 
        bg-white 
        flex items-center justify-center
        ${isExiting ? 'animate-splash-fade-out' : ''}
      `}
      role="main"
      aria-label="Schermata di avvio"
    >
      <div className="animate-splash-entry">
        <Image
          src="/mobile/splash-logo.png"
          alt="Fracassa Autolinee logo"
          width={209}
          height={209}
          priority
          className="w-[209px] h-[209px]"
        />
      </div>
      
      {/* Accessibility: Announce loading state to screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        Caricamento dell&apos;applicazione Fracassa Autolinee
      </div>
    </div>
  );
}

