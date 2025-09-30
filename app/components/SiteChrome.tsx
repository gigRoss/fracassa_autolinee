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
      <header className="w-full border-b border-black/10 dark:border-white/15 bg-[var(--neutral-0)]/90 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--neutral-0)/75]">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3">
            <img src="/fracassa-logo.png" alt="Fracassa Autolinee" width={160} height={36} />
          </a>
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <a href="tel:+390861410578" className="btn btn-accent">Chiama +39 0861 410578</a>
            <a href="https://wa.me/393451120967" className="btn btn-outline-accent" target="_blank" rel="noopener noreferrer">WhatsApp +39 345 1120967</a>
            <a href="mailto:autolineefracassa@alice.it" className="hover:underline text-[var(--brand-secondary)]">autolineefracassa@alice.it</a>
            <form action="/admin/logout" method="post">
              <button type="submit" className="btn btn-accent" title="Area Admin">Area Admin</button>
            </form>
          </div>
        </div>
      </header>

      {children}

      <footer className="w-full border-t border-black/10 dark:border-white/15 mt-12">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-center text-[color:var(--neutral-600)]">
          © Fracassa Autolinee S.r.l. · P. IVA 01765220676
        </div>
      </footer>
    </>
  );
}


