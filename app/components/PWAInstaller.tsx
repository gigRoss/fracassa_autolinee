"use client";

import { useEffect, useState } from "react";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Registra il Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registrato:', registration.scope);
          })
          .catch((error) => {
            console.log('❌ Errore registrazione Service Worker:', error);
          });
      });
    }

    // Gestione del prompt di installazione
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previeni il mini-infobar automatico su mobile
      e.preventDefault();
      // Salva l'evento per usarlo dopo
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Controlla se l'app è già installata
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ App già installata come PWA');
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostra il prompt di installazione
    deferredPrompt.prompt();

    // Aspetta la scelta dell'utente
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Utente ha ${outcome === 'accepted' ? 'accettato' : 'rifiutato'} l'installazione`);

    // Pulisci il prompt
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (!showInstallButton) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-[var(--brand-primary)] text-white rounded-lg shadow-lg p-4 flex items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold mb-1">Installa l'App</p>
          <p className="text-sm opacity-90">
            Aggiungi Fracassa Autolinee alla tua home screen per un accesso rapido
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="bg-white text-[var(--brand-primary)] px-4 py-2 rounded font-semibold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Installa
          </button>
          <button
            onClick={() => setShowInstallButton(false)}
            className="text-white hover:bg-white/20 px-2 rounded transition-colors"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

