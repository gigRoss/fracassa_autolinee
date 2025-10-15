"use client";

import { useEffect, useRef } from 'react';

export function useAnalytics() {
  const hasConsent = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('cookie_consent') === 'accepted';
  };

  const getSessionId = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('analytics_session_id');
  };

  // Tracking anonimo (sempre attivo, nessun dato personale)
  const trackEvent = async (eventType: string, eventData?: Record<string, any>) => {
    try {
      // Fire and forget - non aspettare risposta
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, eventData }),
        // keepalive: true garantisce che la richiesta completi anche se utente naviga via
        keepalive: true,
      }).catch(err => console.error('Analytics tracking error:', err));
    } catch (error) {
      // Silently fail - tracking non deve mai rompere l'app
    }
  };

  // Tracking sessione (solo con consenso)
  const trackSessionEvent = async (eventType: string, eventData?: Record<string, any>) => {
    if (!hasConsent()) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    try {
      fetch('/api/analytics/session/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, eventType, eventData }),
        keepalive: true,
      }).catch(err => console.error('Session tracking error:', err));
    } catch (error) {
      // Silently fail
    }
  };

  return {
    trackEvent,
    trackSessionEvent,
    hasConsent: hasConsent(),
  };
}

// Hook per pageview automatico
export function usePageview(pagePath?: string) {
  const { trackEvent } = useAnalytics();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      const path = pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/');
      trackEvent('pageview', { path });
      tracked.current = true;
    }
  }, [pagePath, trackEvent]);
}

