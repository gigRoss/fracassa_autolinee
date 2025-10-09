"use client";

import { useState, useEffect } from 'react';

// Helper function per generare UUID compatibile con tutti i browser
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback per browser che non supportano crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [consent, setConsent] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  useEffect(() => {
    // Controlla se utente ha già scelto
    const savedConsent = localStorage.getItem('cookie_consent');
    
    if (savedConsent) {
      setConsent(savedConsent as any);
      setShowBanner(false);
      
      if (savedConsent === 'accepted') {
        initializeAnalytics();
      }
    } else {
      // Mostra banner dopo 2 secondi
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setConsent('accepted');
    setShowBanner(false);
    initializeAnalytics();
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setConsent('rejected');
    setShowBanner(false);
    // Solo tracking anonimo (livello 1) continuerà a funzionare
  };

  const initializeAnalytics = () => {
    // Genera sessionId se non esiste
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = generateUUID();
      localStorage.setItem('analytics_session_id', sessionId);
    }

    // Rileva se PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;

    // Invia dati sessione al server
    fetch('/api/analytics/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        isPWA,
      }),
    }).catch(err => console.error('Analytics session error:', err));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-lg p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              🍪 Utilizzo dei Cookie
            </h3>
            <p className="text-sm text-gray-600">
              Utilizziamo cookie analytics per migliorare la tua esperienza e capire come viene utilizzato il servizio. 
              I dati sono anonimi e conformi GDPR.
              {' '}
              <button 
                onClick={() => alert('Privacy Policy: Raccogliamo solo dati aggregati anonimi per migliorare il servizio. Con il tuo consenso, tracciamo la tua sessione (senza dati personali). Puoi cancellare i dati in qualsiasi momento.')}
                className="underline hover:text-gray-800"
              >
                Maggiori informazioni
              </button>
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Solo necessari
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 md:flex-none px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              Accetta tutti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

