"use client";

import { usePathname } from "next/navigation";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/admin");

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative w-full h-[33vh] min-h-[250px] overflow-hidden">
        <img 
          src="/pullman_fraca.jpg" 
          alt="Fracassa Autolinee - Pullman" 
          className="w-full h-full object-cover scale-[1.2]"
          style={{ objectPosition: '30% 28%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
      </div>

      {children}

      <footer className="w-full border-t border-black/10 dark:border-white/15 mt-12">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-center text-[color:var(--neutral-600)]">
          <div className="mb-4 flex justify-center">
            <img src="/fracassa-logo.png" alt="Fracassa Autolinee" width={160} height={36} />
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold text-[color:var(--neutral-900)] mb-2">Contatti</h3>
            <div className="flex flex-col gap-1">
              <a href="tel:+390861410578" className="hover:underline text-[var(--brand-secondary)]">
                📞 +39 0861 410578
              </a>
              <a href="https://wa.me/393451120967" className="hover:underline text-[var(--brand-secondary)]" target="_blank" rel="noopener noreferrer">
                💬 WhatsApp +39 345 1120967
              </a>
              <a href="mailto:autolineefracassa@alice.it" className="hover:underline text-[var(--brand-secondary)]">
                ✉️ autolineefracassa@alice.it
              </a>
            </div>
          </div>

          <div className="mb-3">
            <a href="/admin/login" className="hover:underline">Area Admin</a>
          </div>
          <div>
            © Fracassa Autolinee S.r.l. · P. IVA 01765220676
          </div>
        </div>
      </footer>
    </>
  );
}


