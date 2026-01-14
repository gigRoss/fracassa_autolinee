"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Rileva iOS/Safari
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsIOS(isIOSDevice || (isSafari && isIOSDevice));

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
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (navigator as any).standalone || 
                         document.referrer.includes('android-app://');
    
    if (isStandalone) {
      console.log('✅ App già installata come PWA');
      setShowInstallButton(false);
    } else if (isIOSDevice && !isStandalone) {
      // Mostra banner per iOS se non è già installata
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Per iOS mostra le istruzioni dettagliate
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    // Mostra il prompt di installazione per Android/Chrome
    deferredPrompt.prompt();

    // Aspetta la scelta dell'utente
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Utente ha ${outcome === 'accepted' ? 'accettato' : 'rifiutato'} l'installazione`);

    // Pulisci il prompt
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleClose = () => {
    setShowInstallButton(false);
    setShowIOSInstructions(false);
  };

  if (!showInstallButton) return null;

  // Banner con istruzioni dettagliate per iOS
  if (isIOS && showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center md:justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--brand-primary)] to-blue-600 text-white p-6 rounded-t-3xl md:rounded-t-2xl">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                  <Image 
                    src="/icon-72x72.png" 
                    alt="Fracassa Autolinee" 
                    width={48} 
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Installa l'App</h3>
                  <p className="text-sm opacity-90">Fracassa Autolinee</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:bg-white/20 w-8 h-8 rounded-full transition-colors flex items-center justify-center"
                aria-label="Chiudi"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Istruzioni iOS */}
          <div className="p-6 space-y-5">
            <div className="text-center">
              <p className="text-gray-700 font-medium mb-4">
                Su iPhone/iPad, segui questi passaggi:
              </p>
            </div>

            {/* Passo 1 */}
            <div className="flex items-start gap-4 bg-blue-50 p-4 rounded-xl">
              <div className="w-8 h-8 bg-[var(--brand-primary)] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 mb-1">
                  Premi i tre puntini in basso a destra
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Cerca l'icona nella barra del browser</span>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex items-start gap-4 bg-blue-50 p-4 rounded-xl">
              <div className="w-8 h-8 bg-[var(--brand-primary)] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 mb-1">
                  Premi il pulsante Condividi
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Cerca l'icona</span>
                  <svg className="w-5 h-5 text-[var(--brand-primary)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 5l-1.42 1.42-1.59-1.59V16h-2V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                  </svg>
                  <span>nel menu</span>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex items-start gap-4 bg-blue-50 p-4 rounded-xl">
              <div className="w-8 h-8 bg-[var(--brand-primary)] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 mb-1">
                  Ripremi i 3 puntini e seleziona "Aggiungi a Home"
                </p>
              
              </div>
            </div>
         

            {/* Nota */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <p className="text-sm text-amber-800">
                <strong>💡 Suggerimento:</strong> Se hai già chiuso questo messaggio, 
                potrebbe non riapparire. Ricordati di installare l'app seguendo i passaggi sopra!
              </p>
            </div>

            {/* Bottone */}
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-[var(--brand-primary)] to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Ho capito!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Banner compatto iniziale (più visibile)
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-md animate-slideUp">
      <div className="bg-gradient-to-r from-[var(--brand-primary)] to-blue-600 text-white shadow-2xl md:rounded-2xl overflow-hidden">
        {/* Barra luminosa animata */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-shimmer"></div>
        
        <div className="p-5 flex items-start gap-4">
          {/* Icona App */}
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 animate-bounce-slow overflow-hidden">
            <Image 
              src="/icon-72x72.png" 
              alt="Fracassa Autolinee" 
              width={56} 
              height={56}
              className="object-contain"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg mb-1 flex items-center gap-2">
              Installa l'App Fracassa
              {isIOS && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">iOS</span>}
            </p>
            <p className="text-sm opacity-95 leading-relaxed">
              {isIOS 
                ? "Accedi rapidamente agli orari e prenota i tuoi biglietti direttamente dalla home screen!"
                : "Aggiungi l'app alla tua home screen per un accesso rapido e offline"
              }
            </p>
          </div>

          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 w-8 h-8 rounded-full transition-colors flex items-center justify-center flex-shrink-0"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        {/* Bottoni azione */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-white text-[var(--brand-primary)] px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            {isIOS ? '📱 Come installare' : '⬇️ Installa ora'}
          </button>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 px-4 rounded-xl transition-colors text-sm font-medium"
          >
            Dopo
          </button>
        </div>
      </div>
    </div>
  );
}

