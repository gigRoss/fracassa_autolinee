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
        flex-col
        items-center
        justify-center
        gap-10
        ${isExiting ? 'animate-splash-fade-out' : ''}
      `}
      role="main"
      aria-label="Schermata di avvio"
    >
      <div
        className="animate-splash-entry cursor-pointer splash-logo-wrapper"
        style={{
          width: '184px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '10px',
        }}
        role="button"
        aria-label="Torna alla pagina principale"
        onClick={() => router.push('/search')}
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

      <div className="loading-dots" aria-hidden="true">
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
      
      {/* Accessibility: Announce loading state to screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        Caricamento dell&apos;applicazione Fracassa Autolinee
      </div>

      <style jsx>{`
        .splash-logo-wrapper {
          transition: transform 0.15s ease, opacity 0.15s ease;
        }

        .splash-logo-wrapper:hover {
          transform: scale(1.02);
          opacity: 0.95;
        }

        .loading-dots {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: center;
          margin-top: 32px;
        }

        .loading-dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #162686;
          opacity: 0.4;
          transform: scale(0.6);
          animation: splash-dot-pulse 1.2s ease-in-out infinite;
        }

        .loading-dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .loading-dot:nth-child(3) {
          animation-delay: 0.3s;
        }

        .loading-dot:nth-child(4) {
          animation-delay: 0.45s;
        }

        @keyframes splash-dot-pulse {
          0%,
          100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
          60% {
            transform: scale(0.6);
            opacity: 0.4;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
